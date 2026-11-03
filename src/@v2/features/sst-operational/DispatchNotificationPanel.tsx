import { useEffect, useId, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSstAccess } from './access';
import { sstGet, sstPost, messageOf } from './api';
import {
  dispatchMailRecipients,
  dispatchMailReviewValid,
  dispatchMailStateLabel,
  type DispatchMailPolicy,
  type DispatchMailRecipient,
  type DispatchMailResult,
  type DispatchMailNotice,
  type MailResolution,
} from './dispatch-mail-model';
const root = '/esocial-dispatch';
/** Every draft is scoped to the signed-in identity AND target company. */
export function DispatchNotificationPanel({
  companyId,
  runId,
}: {
  companyId: string;
  runId?: string;
}) {
  const access = useSstAccess();
  return (
    <NotificationDraft
      key={`${access.userId}:${access.companyId}:${companyId}`}
      companyId={companyId}
      runId={runId}
    />
  );
}
function NotificationDraft({
  companyId,
  runId,
}: {
  companyId: string;
  runId?: string;
}) {
  const access = useSstAccess(),
    client = useQueryClient(),
    id = useId();
  const identity = [access.userId, access.companyId, companyId];
  const [expanded, setExpanded] = useState(false),
    [draft, setDraft] = useState<DispatchMailPolicy | null>(null),
    [selected, setSelected] = useState<DispatchMailRecipient[]>([]),
    [search, setSearch] = useState(''),
    [lookup, setLookup] = useState(''),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false);
  const [review, setReview] = useState<DispatchMailResult | null>(null),
    [reviewRun, setReviewRun] = useState(''),
    [action, setAction] = useState<MailResolution>('RETRY_FAILED'),
    [reason, setReason] = useState(''),
    [checked, setChecked] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => setLookup(search), 300);
    return () => clearTimeout(timeout);
  }, [search]);
  const policy = useQuery<{
    policy: DispatchMailPolicy;
    transportEnabled: boolean;
  }>(
    ['sst-mail-policy', ...identity],
    () => sstGet(companyId, `${root}/notification-policy`),
    { enabled: access.canReadDeclaration && expanded, retry: false },
  );
  const people = useInfiniteQuery<{
    users: DispatchMailRecipient[];
    selected: DispatchMailRecipient[];
    nextCursor: string | null;
  }>(
    ['sst-mail-recipients', ...identity, lookup],
    ({ pageParam }) => {
      const params = new URLSearchParams({ search: lookup });
      if (pageParam) params.set('cursor', pageParam);
      return sstGet(companyId, `${root}/notification-recipients?${params}`);
    },
    {
      enabled: access.canSendDeclaration && expanded,
      retry: false,
      getNextPageParam: (p) => p.nextCursor || undefined,
    },
  );
  const results = useInfiniteQuery<{
    notices: DispatchMailNotice[];
    nextCursor: string | null;
  }>(
    ['sst-mail-results', ...identity, runId],
    ({ pageParam }) =>
      sstGet(
        companyId,
        `${root}/runs/${runId}/notifications${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    {
      enabled: access.canReadDeclaration && expanded && !!runId,
      retry: false,
      refetchInterval: 10000,
      getNextPageParam: (p) => p.nextCursor || undefined,
    },
  );
  const settings = draft || policy.data?.policy;
  const existing = people.data?.pages[0]?.selected || [];
  const selection = draft ? selected : existing;
  const options = dispatchMailRecipients(
    (people.data?.pages || []).flatMap((p) => p.users),
    selection,
  );
  const edit = (values: Partial<DispatchMailPolicy>) => {
    if (!settings) return;
    if (!draft) setSelected(existing);
    setDraft({ ...settings, ...values });
    setNotice('');
  };
  const refresh = () =>
    Promise.all([
      client.invalidateQueries(['sst-mail-policy', ...identity]),
      client.invalidateQueries(['sst-mail-recipients', ...identity]),
      client.invalidateQueries(['sst-mail-results', ...identity]),
    ]);
  const save = async () => {
    if (!settings || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await sstPost(companyId, `${root}/notification-policy`, {
        expectedRevision: settings.revision,
        enabled: settings.enabled,
        notifyOperator: settings.notifyOperator,
        responsibleUserIds: selection.map((u) => u.id),
      });
      setDraft(null);
      setNotice(
        'Preferências de e-mail atualizadas. Os próximos resumos usarão esta configuração.',
      );
      await refresh();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  const discardAndReload = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const currentPolicy = await policy.refetch();
      if (currentPolicy.error) throw currentPolicy.error;
      const currentPeople = await people.refetch();
      if (currentPeople.error) throw currentPeople.error;
      setDraft(null);
      setSelected([]);
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };
  const openReview = (m: DispatchMailResult) => {
    setReview(m);
    setReviewRun(runId || '');
    setAction(m.state === 'FAILED' ? 'RETRY_FAILED' : 'CONFIRM_SENT');
    setReason('');
    setChecked(false);
    setError('');
  };
  const resolve = async () => {
    if (
      !review ||
      !dispatchMailReviewValid(review, action, reason, checked) ||
      busy
    )
      return;
    setBusy(true);
    setError('');
    try {
      await sstPost(
        companyId,
        `${root}/runs/${reviewRun}/notifications/${review.id}/resolve`,
        { action, expectedUpdatedAt: review.updatedAt, reason: reason.trim() },
      );
      setReview(null);
      setNotice(
        action === 'CONFIRM_SENT'
          ? 'Conferência registrada. Este e-mail não será reenviado.'
          : 'Conferência registrada. A nova tentativa será executada pela fila.',
      );
      await refresh();
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setBusy(false);
    }
  };
  if (!access.canReadDeclaration) return null;
  return (
    <Accordion
      role="region"
      aria-label="Avisos por e-mail da empresa"
      expanded={expanded}
      onChange={(_, value) => setExpanded(value)}
      disableGutters
      sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={600}>Avisos por e-mail</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: '16px' }}>
        <Stack sx={{ gap: '24px' }}>
          <Typography variant="body2">
            Receba resumos de atenção e conclusão da execução, sem um e-mail por
            empregado. O e-mail não inclui CPF, XML, exames ou certificados.
          </Typography>
          {policy.isLoading && (
            <LinearProgress aria-label="Carregando preferências de e-mail" />
          )}
          {!!policy.error && (
            <Alert severity="error">{messageOf(policy.error)}</Alert>
          )}
          {policy.data && !policy.data.transportEnabled && (
            <Alert severity="info">
              O envio de e-mails está desativado neste ambiente. As preferências
              e os resumos ficam registrados; nenhum e-mail será enviado
              enquanto a administração não habilitar o serviço.
            </Alert>
          )}
          {settings && (
            <Box
              component="section"
              aria-label="Preferências de e-mail da empresa"
            >
              <Stack sx={{ gap: '16px' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.enabled}
                      disabled={
                        !access.canSendDeclaration ||
                        busy ||
                        people.isLoading ||
                        !!people.error
                      }
                      onChange={(_, enabled) => edit({ enabled })}
                    />
                  }
                  label="Receber resumos de execução por e-mail"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={settings.notifyOperator}
                      disabled={
                        !access.canSendDeclaration ||
                        busy ||
                        !settings.enabled ||
                        people.isLoading ||
                        !!people.error
                      }
                      onChange={(_, notifyOperator) => edit({ notifyOperator })}
                    />
                  }
                  label="Notificar também quem iniciou o envio"
                />
                {access.canSendDeclaration && (
                  <>
                    <Autocomplete
                      multiple
                      id={`mail-${id}-people`}
                      options={options}
                      value={selection}
                      disabled={busy || !settings.enabled || people.isLoading}
                      loading={people.isFetching}
                      getOptionLabel={(p) => `${p.name} · ${p.email}`}
                      isOptionEqualToValue={(a, b) => a.id === b.id}
                      filterOptions={(o) => o}
                      onInputChange={(_, v) => setSearch(v)}
                      onChange={(_, users) => {
                        if (users.length > 20) return;
                        edit({});
                        setSelected(users);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Responsáveis da empresa"
                          helperText="Até 20 usuários cadastrados com acesso atual ao eSocial. Não digite e-mails externos."
                        />
                      )}
                    />
                    {!!people.error && (
                      <Alert severity="error">{messageOf(people.error)}</Alert>
                    )}
                    {people.hasNextPage && (
                      <Button
                        onClick={() => people.fetchNextPage()}
                        disabled={people.isFetching}
                      >
                        Carregar mais responsáveis
                      </Button>
                    )}
                    {settings.responsibleUserIds.some(
                      (userId) => !existing.some((u) => u.id === userId),
                    ) &&
                      !people.isLoading && (
                        <Alert severity="warning">
                          Há responsáveis que perderam o acesso. Eles não
                          receberão novos avisos; confira a seleção antes de
                          salvar.
                        </Alert>
                      )}
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      sx={{ gap: '12px' }}
                    >
                      <Button
                        variant="contained"
                        onClick={save}
                        disabled={
                          busy || people.isLoading || !!people.error || !draft
                        }
                      >
                        Salvar preferências de e-mail
                      </Button>
                      {draft && (
                        <Button disabled={busy} onClick={discardAndReload}>
                          Descartar edição e carregar configuração atual
                        </Button>
                      )}
                    </Stack>
                  </>
                )}
                {!access.canSendDeclaration && (
                  <Typography variant="body2">
                    Consulta disponível. Somente quem gerencia envios pode
                    alterar destinatários.
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
          {!!runId && (
            <Box component="section" aria-label="E-mails desta execução">
              <Stack sx={{ gap: '16px' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  E-mails desta execução
                </Typography>
                <Typography variant="body2">
                  “Aceito pelo provedor” confirma o recebimento pelo serviço de
                  e-mail; a entrega na caixa de entrada não é garantida.
                  Resultados incertos exigem conferir o provedor antes de
                  autorizar outra tentativa.
                </Typography>
                {!!results.error && (
                  <Alert severity="error">{messageOf(results.error)}</Alert>
                )}
                {results.isLoading && <LinearProgress />}
                {results.data &&
                  !results.data.pages.some((p) => p.notices.length) && (
                    <Typography variant="body2">
                      O resumo será registrado quando esta execução terminar ou
                      precisar de atenção.
                    </Typography>
                  )}
                {(results.data?.pages || [])
                  .flatMap((p) => p.notices)
                  .map((n) => (
                    <Box
                      key={n.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: '16px',
                      }}
                    >
                      <Stack sx={{ gap: '12px' }}>
                        <Typography fontWeight={600}>
                          {n.kind === 'ATTENTION'
                            ? 'Execução requer atenção'
                            : 'Resumo de conclusão'}{' '}
                          · rodada {n.round}
                        </Typography>
                        <Typography variant="body2">
                          {new Date(n.createdAt).toLocaleString('pt-BR')} ·{' '}
                          {dispatchMailStateLabel(n.state)}
                        </Typography>
                        {!n.recipients.length && (
                          <Typography variant="body2">
                            {n.state === 'SUPPRESSED'
                              ? 'Aviso desativado, substituído ou sem destinatário autorizado.'
                              : 'Aguardando definição dos destinatários pelo serviço de e-mail.'}
                          </Typography>
                        )}
                        {n.recipients.map((m) => (
                          <Stack
                            key={m.id}
                            sx={{ gap: '8px', overflowWrap: 'anywhere' }}
                          >
                            <Typography variant="body2">
                              {m.role === 'OPERATOR'
                                ? 'Operador'
                                : 'Responsável'}{' '}
                              · {m.address} · {dispatchMailStateLabel(m.state)}
                            </Typography>
                            {['UNKNOWN', 'FAILED'].includes(m.state) && (
                              <Alert severity="warning">
                                {m.state === 'UNKNOWN'
                                  ? 'O provedor pode ter recebido este aviso. Não há reenvio automático.'
                                  : 'Confira a configuração e o erro no serviço antes de tentar novamente.'}
                                {m.errorCode && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    display="block"
                                  >
                                    Código: {m.errorCode}
                                  </Typography>
                                )}
                              </Alert>
                            )}
                            {access.canSendDeclaration &&
                              ['UNKNOWN', 'FAILED'].includes(m.state) && (
                                <Button
                                  sx={{ alignSelf: 'flex-start' }}
                                  onClick={() => openReview(m)}
                                >
                                  Conferir resultado do e-mail
                                </Button>
                              )}
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                {results.hasNextPage && (
                  <Button
                    onClick={() => results.fetchNextPage()}
                    disabled={results.isFetching}
                  >
                    Carregar resumos anteriores
                  </Button>
                )}
              </Stack>
            </Box>
          )}
          {error && !review && <Alert severity="error">{error}</Alert>}
          {notice && <Alert severity="success">{notice}</Alert>}
        </Stack>
      </AccordionDetails>
      <Dialog
        open={!!review}
        onClose={() => {
          if (!busy) setReview(null);
        }}
        maxWidth="sm"
        fullWidth
        aria-labelledby={`mail-${id}-review-title`}
      >
        <DialogTitle id={`mail-${id}-review-title`}>
          Conferir resultado do e-mail
        </DialogTitle>
        <DialogContent sx={{ pt: '12px !important' }}>
          <Stack sx={{ gap: '24px', pt: '8px' }}>
            <Typography>
              {review?.address} ·{' '}
              {review && dispatchMailStateLabel(review.state)}
            </Typography>
            {review?.state === 'UNKNOWN' && (
              <Alert severity="warning">
                Confira no provedor o resultado desta tentativa antes de
                escolher. Um reenvio sem conferência pode duplicar o e-mail.
                Referência: {review.id}
              </Alert>
            )}
            <TextField
              id={`mail-${id}-action`}
              select
              label="Resultado da conferência"
              value={action}
              disabled={busy}
              SelectProps={{
                SelectDisplayProps: {
                  'aria-labelledby': `mail-${id}-action-label`,
                },
              }}
              onChange={(e) => setAction(e.target.value as MailResolution)}
            >
              {review?.state === 'FAILED' ? (
                <MenuItem value="RETRY_FAILED">
                  Configuração corrigida: tentar novamente
                </MenuItem>
              ) : (
                [
                  <MenuItem key="sent" value="CONFIRM_SENT">
                    Provedor confirmou recebimento: não reenviar
                  </MenuItem>,
                  <MenuItem key="retry" value="RETRY_CONFIRMED_NOT_SENT">
                    Provedor confirmou que não recebeu: tentar novamente
                  </MenuItem>,
                ]
              )}
            </TextField>
            {review?.state === 'UNKNOWN' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checked}
                    disabled={busy}
                    onChange={(_, v) => setChecked(v)}
                  />
                }
                label="Conferi o resultado desta tentativa no provedor de e-mail"
              />
            )}
            <TextField
              multiline
              minRows={3}
              label="Conferência realizada"
              value={reason}
              disabled={busy}
              onChange={(e) => setReason(e.target.value)}
              inputProps={{ maxLength: 500 }}
              helperText="Ao menos 10 caracteres. Registre a referência da conferência; não inclua senhas nem dados de empregados."
            />
            {error && (
              <Alert severity="error">
                {error} Feche e abra novamente a conferência para consultar a
                versão atual.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <Button disabled={busy} onClick={() => setReview(null)}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={
              busy ||
              !review ||
              !dispatchMailReviewValid(review, action, reason, checked)
            }
            onClick={resolve}
          >
            Registrar conferência
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  );
}
