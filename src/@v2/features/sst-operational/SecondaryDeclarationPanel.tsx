import { esocialEnvironment } from './environment-model';
import { SecondaryBulkDispatchPanel } from './SecondaryBulkDispatchPanel';
import { useEffect, useId, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { useSstAccess } from './access';
import { LegalDeadlineSummary } from './LegalDeadlineSummary';
import { diagnosticMessage, messageOf, sstGet, sstPost } from './api';
import {
  declarationDeliveryLabel,
  deliveryErrorMessage,
  deliveryStateLabel,
} from './delivery-model';
import {
  SECONDARY_EVENT_TYPES,
  canConfirmSecondary,
  canCancelSecondary,
  canRetrySecondary,
  secondaryEventLabels,
  secondaryPreparationLabel,
  secondaryDisplayLabel,
  secondarySourceHasChanged,
  secondaryRequestKey,
  secondarySourceLabels,
  secondaryReviews,
  secondarySourceOptions,
  secondarySourceHasNoChanges,
  secondaryPrepareRequest,
  secondaryReviewStateLabel,
  type SecondaryReviewPage,
  type SecondaryEventType,
  type SecondaryOverview,
  type SecondaryPreparation,
  type SecondarySourceOption,
} from './secondary-delivery-model';

const root = '/esocial-events';
const dateLabel = (date?: string | null) =>
  date?.slice(0, 10).split('-').reverse().join('/') || '—';

/** Existing operational records supply the declaration; this panel never edits XML. */
export function SecondaryDeclarationPanel({
  companyId,
  initialSelection,
  initialEnvironment = 2,
}: {
  companyId: string;
  initialSelection?: {
    id: string;
    type: SecondaryEventType;
    environment: 1 | 2;
  };
  initialEnvironment?: 1 | 2;
}) {
  const access = useSstAccess();
  const selectId = useId();
  const selectField = (field: string) => ({
    id: `secondary-${selectId}-${field}`,
    SelectProps: {
      SelectDisplayProps: {
        'aria-labelledby': `secondary-${selectId}-${field}-label`,
      },
    },
  });
  const client = useQueryClient();
  const [type, setType] = useState<SecondaryEventType>(
    initialSelection?.type || 'S-2210',
  );
  const [selectedEnvironment, setEnvironment] = useState<1 | 2>(
    initialSelection?.environment || initialEnvironment,
  );
  const environment = esocialEnvironment(
    access.canChooseEnvironment,
    selectedEnvironment,
  );
  const [kind, setKind] = useState<'ORIGINAL' | 'RECTIFICATION'>('ORIGINAL');
  const [employerRegistration, setEmployerRegistration] = useState('');
  const [source, setSource] = useState<SecondarySourceOption | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [reason, setReason] = useState('');
  const [selectedId, setSelectedId] = useState(initialSelection?.id || '');
  const [prepared, setPrepared] = useState<SecondaryPreparation>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [xml, setXml] = useState('');
  const attempt = useRef<{ key: string; operationId: string } | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);
  const overview = useQuery<SecondaryOverview>(
    [
      'sst-secondary-declarations',
      companyId,
      type,
      environment,
      debouncedSearch,
    ],
    () =>
      sstGet(
        companyId,
        `${root}/${type}?environment=${environment}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`,
      ),
    {
      enabled: access.canReadDeclaration,
      retry: false,
      refetchInterval: 5000,
      keepPreviousData: false,
    },
  );
  const previousSources = useInfiniteQuery<SecondaryReviewPage>(
    ['sst-secondary-reviews', companyId, type, environment, debouncedSearch],
    ({ pageParam }) =>
      sstGet(
        companyId,
        `${root}/reviews?type=${type}&environment=${environment}&limit=50${pageParam ? `&cursor=${encodeURIComponent(pageParam)}` : ''}${debouncedSearch ? `&search=${encodeURIComponent(debouncedSearch)}` : ''}`,
      ),
    {
      enabled: access.canReadDeclaration && type !== 'S-3000',
      retry: false,
      refetchInterval: 30_000,
      getNextPageParam: (page) => page.nextCursor || undefined,
    },
  );
  const previousReviews = secondaryReviews(
    previousSources.data?.pages || [],
    type,
    environment,
  );
  const detail = useQuery<SecondaryPreparation>(
    ['sst-secondary-declaration', companyId, type, selectedId],
    () => sstGet(companyId, `${root}/${type}/${selectedId}`),
    {
      enabled: access.canReadDeclaration && !!selectedId,
      retry: false,
      refetchInterval: 5000,
    },
  );
  const event =
    detail.data || (prepared?.id === selectedId ? prepared : undefined);
  const enabled = Boolean(
    environment === 2
      ? overview.data?.environments.restricted
      : overview.data?.environments.production,
  );
  const registrationOptions = overview.data?.employerRegistrationOptions || [];
  const registrationRequired = type !== 'S-3000' && kind === 'ORIGINAL';
  const registrationAvailable = registrationOptions.some(
    (option) => option.value === employerRegistration,
  );
  const options = secondarySourceOptions(
    overview.data?.sources || [],
    previousReviews,
  );
  const currentSource =
    source && options.find((item) => String(item.id) === String(source.id));
  const sourceChanged = secondarySourceHasChanged(source, currentSource);
  const sourceOptions = secondarySourceOptions(options, [], source);
  const resetType = (next: SecondaryEventType) => {
    setType(next);
    setKind('ORIGINAL');
    setSource(null);
    setSearch('');
    setDebouncedSearch('');
    setSelectedId('');
    setPrepared(undefined);
    setError('');
    attempt.current = null;
  };
  const prepare = async () => {
    if (
      !source ||
      !reason.trim() ||
      busy ||
      sourceChanged ||
      source.needsExclusion ||
      (type !== 'S-3000' && secondarySourceHasNoChanges(source))
    )
      return;
    let body: ReturnType<typeof secondaryPrepareRequest>;
    try {
      body = secondaryPrepareRequest({
        type,
        environment,
        kind,
        source,
        reason,
        employerRegistration,
        allowedRegistrations: registrationOptions.map((option) => option.value),
      });
    } catch (failure) {
      setError(messageOf(failure));
      return;
    }
    const key = secondaryRequestKey({ type, ...body });
    if (attempt.current?.key !== key)
      attempt.current = { key, operationId: crypto.randomUUID() };
    setBusy(true);
    setError('');
    try {
      const result = await sstPost(companyId, `${root}/${type}/prepare`, {
        ...body,
        operationId: attempt.current.operationId,
      });
      setPrepared(result);
      setSelectedId(result.id);
      attempt.current = null;
      await client.invalidateQueries([
        'sst-secondary-declarations',
        companyId,
        type,
      ]);
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };
  const act = async (action: 'confirm' | 'cancel' | 'retry-blocked') => {
    if (!event || busy) return;
    setBusy(true);
    setError('');
    try {
      await sstPost(
        companyId,
        `${root}/${type}/${event.id}/${action}`,
        action === 'confirm' ? { expectedSourceHash: event.sourceHash } : {},
      );
      await Promise.all([
        client.invalidateQueries(['sst-secondary-declarations', companyId]),
        client.invalidateQueries([
          'sst-secondary-declaration',
          companyId,
          type,
          selectedId,
        ]),
        client.invalidateQueries(['sst-declarations', companyId]),
        client.invalidateQueries(['sst-secondary-reviews', companyId]),
      ]);
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };
  if (!access.canReadDeclaration) return null;
  return (
    <Stack spacing={8} useFlexGap>
      <Typography variant="h6">
        CAT, saúde, toxicológicos e exclusões
      </Typography>
      <Typography>
        Os dados vêm dos cadastros de origem. Confira as informações e os
        impedimentos antes de confirmar a transmissão.
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={8} useFlexGap>
        <TextField
          {...selectField('type')}
          select
          fullWidth
          label="Tipo de evento"
          value={type}
          disabled={busy}
          onChange={(e) => resetType(e.target.value as SecondaryEventType)}
        >
          {SECONDARY_EVENT_TYPES.map((item) => (
            <MenuItem key={item} value={item}>
              {secondaryEventLabels[item]}
            </MenuItem>
          ))}
        </TextField>
        {access.canChooseEnvironment && (
          <TextField
            {...selectField('environment')}
            select
            fullWidth
            label="Ambiente destes eventos"
            value={environment}
            disabled={busy}
            onChange={(e) => {
              setEnvironment(Number(e.target.value) as 1 | 2);
              setEmployerRegistration('');
              setSource(null);
              setPrepared(undefined);
              setSelectedId('');
              setError('');
              attempt.current = null;
            }}
          >
            <MenuItem value={2}>Produção restrita — testes</MenuItem>
            <MenuItem value={1}>Produção — envio oficial</MenuItem>
          </TextField>
        )}
      </Stack>
      <Alert severity={environment === 1 ? 'warning' : 'info'}>
        {environment === 1
          ? 'A confirmação transmite uma declaração oficial ao eSocial.'
          : 'Produção restrita: ambiente de testes do eSocial.'}
        {!enabled &&
          ' A transmissão está desabilitada neste ambiente. Você pode preparar e conferir os dados.'}
      </Alert>
      {type !== 'S-3000' && (
        <TextField
          {...selectField('registration')}
          select
          fullWidth
          label="Inscrição do empregador no eSocial"
          value={employerRegistration}
          disabled={busy}
          helperText={`Escolha a inscrição usada no cadastro do empregador (S-1000).${overview.data?.employerRegistrationDefault ? ` Sugestão para conferência: ${overview.data?.employerRegistrationDefault}.` : ''} A escolha será preservada no XML.`}
          onChange={(event) => {
            setEmployerRegistration(event.target.value);
            attempt.current = null;
          }}
        >
          <MenuItem value="">Selecione a inscrição cadastrada</MenuItem>
          {employerRegistration && !registrationAvailable && (
            <MenuItem value={employerRegistration} disabled>
              {employerRegistration} — confira o cadastro atualizado
            </MenuItem>
          )}
          {registrationOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label} · {option.value}
            </MenuItem>
          ))}
        </TextField>
      )}
      <SecondaryBulkDispatchPanel
        companyId={companyId}
        type={type}
        environment={environment}
        employerRegistration={employerRegistration}
        enabled={enabled}
        onOpenEvent={(id) => {
          setSelectedId(id);
          setPrepared(undefined);
          setError('');
        }}
      />
      {type === 'S-3000' && (
        <Alert severity="warning">
          A exclusão só é concluída após a aceitação pelo eSocial. O evento
          original, seu XML e recibo permanecem consultáveis. Esta operação não
          apaga o cadastro de origem.
        </Alert>
      )}
      {overview.isLoading && (
        <CircularProgress
          size={24}
          aria-label="Carregando origens dos eventos"
        />
      )}
      {overview.isError && (
        <Alert severity="error">
          Não foi possível consultar as origens.{' '}
          <Button onClick={() => overview.refetch()}>Tentar novamente</Button>
        </Alert>
      )}
      {overview.data && (
        <>
          {type !== 'S-3000' && (
            <Box
              role="region"
              aria-label="Pendências de cadastros anteriores"
              sx={{
                p: '16px',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Stack spacing={8} useFlexGap>
                <Typography variant="subtitle1">
                  Pendências de cadastros anteriores
                </Typography>
                <Typography variant="body2">
                  A conferência em segundo plano também identifica cadastros
                  antigos. Eles continuam disponíveis aqui mesmo quando saem da
                  lista dos mais recentes. Selecionar uma pendência não
                  transmite nada.
                </Typography>
                {previousSources.isError && (
                  <Alert severity="warning">
                    Não foi possível atualizar esta lista. As páginas já
                    carregadas e seu rascunho foram mantidos.{' '}
                    <Button
                      disabled={previousSources.isFetching}
                      onClick={() => previousSources.refetch()}
                    >
                      Consultar pendências novamente
                    </Button>
                  </Alert>
                )}
                {previousSources.isLoading && (
                  <Typography>Consultando pendências anteriores…</Typography>
                )}
                {!previousSources.isLoading &&
                  !previousSources.isError &&
                  !previousReviews.length && (
                    <Typography variant="body2">
                      Nenhuma pendência anterior encontrada nesta consulta. A
                      conferência pode continuar em segundo plano.
                    </Typography>
                  )}
                {!!previousReviews.length && (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table
                      size="small"
                      aria-label="Cadastros anteriores com pendências"
                    >
                      <TableHead>
                        <TableRow>
                          <TableCell>Cadastro de origem</TableCell>
                          <TableCell>Situação</TableCell>
                          <TableCell>Conferência</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {previousReviews.map((item) => (
                          <TableRow key={item.reviewId}>
                            <TableCell>
                              {secondaryDisplayLabel(item.label)}
                              {item.date && (
                                <Typography variant="caption" display="block">
                                  {dateLabel(item.date)}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {secondaryReviewStateLabel(item.state)}
                              <LegalDeadlineSummary
                                value={item.legalDeadline}
                                label="Prazo legal da pendência"
                                compact
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                disabled={
                                  busy ||
                                  previousSources.isFetching ||
                                  item.state === 'SOURCE_MISSING'
                                }
                                onClick={() => {
                                  setSource(item);
                                  setKind(
                                    item.lastAcceptedDeliveryId
                                      ? 'RECTIFICATION'
                                      : 'ORIGINAL',
                                  );
                                  attempt.current = null;
                                }}
                              >
                                Selecionar cadastro
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                )}
                {previousSources.hasNextPage && (
                  <Button
                    disabled={previousSources.isFetching}
                    onClick={() => previousSources.fetchNextPage()}
                  >
                    Carregar mais pendências anteriores
                  </Button>
                )}
                {!!previousReviews.length && (
                  <Typography variant="caption" color="text.secondary">
                    {previousReviews.length} cadastro(s) carregado(s). Complete
                    os dados obrigatórios na origem; retificações e exclusões
                    usam o recibo aceito registrado.
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
          {type !== 'S-3000' && (
            <TextField
              {...selectField('operation')}
              select
              label="Operação deste evento"
              value={kind}
              disabled={busy}
              onChange={(e) => {
                setKind(e.target.value as typeof kind);
              }}
            >
              <MenuItem
                value="ORIGINAL"
                disabled={!!source?.lastAcceptedDeliveryId}
              >
                Enviar cadastro ainda não declarado
              </MenuItem>
              <MenuItem
                value="RECTIFICATION"
                disabled={!source?.lastAcceptedDeliveryId}
              >
                Retificar evento aceito
              </MenuItem>
            </TextField>
          )}
          <Autocomplete
            id={`secondary-${selectId}-source`}
            options={sourceOptions}
            value={source}
            disabled={busy}
            filterOptions={(items) => items}
            getOptionLabel={(item) => secondaryDisplayLabel(item.label)}
            isOptionEqualToValue={(a, b) => String(a.id) === String(b.id)}
            onChange={(_, item) => {
              setSource(item);
              setKind(
                type !== 'S-3000' && item?.lastAcceptedDeliveryId
                  ? 'RECTIFICATION'
                  : 'ORIGINAL',
              );
            }}
            onInputChange={(_, value, cause) => {
              if (cause === 'input' || cause === 'clear') setSearch(value);
            }}
            noOptionsText="Nenhum cadastro disponível. Confira a origem e os filtros."
            renderInput={(params) => (
              <TextField
                {...params}
                label={secondarySourceLabels[type]}
                helperText="Pesquise o empregado ou a identificação do cadastro."
              />
            )}
          />
          {source && (
            <Typography variant="body2">
              {source.employeeName || secondaryDisplayLabel(source.label)}
              {source.date ? ` · ${dateLabel(source.date)}` : ''}
              {source.receipt ? ` · Recibo ${source.receipt}` : ''}
            </Typography>
          )}
          {source && (
            <LegalDeadlineSummary
              value={currentSource?.legalDeadline || source.legalDeadline}
              label="Prazo legal do cadastro selecionado"
            />
          )}
          {sourceChanged && (
            <Alert severity="warning">
              Os dados ou o recibo desta origem foram atualizados. O motivo foi
              mantido; carregue o cadastro atual para conferir as informações
              antes de preparar outra operação.
              <Button
                disabled={busy}
                onClick={() => {
                  setSource(currentSource || null);
                  setKind(
                    currentSource?.lastAcceptedDeliveryId
                      ? 'RECTIFICATION'
                      : 'ORIGINAL',
                  );
                  attempt.current = null;
                }}
              >
                Carregar origem atual
              </Button>
            </Alert>
          )}
          {type !== 'S-3000' &&
            secondarySourceHasNoChanges(source) &&
            !sourceChanged && (
              <Alert severity="info">
                Este cadastro está igual ao último evento aceito. Nenhuma
                retificação é necessária.
              </Alert>
            )}
          {source?.needsExclusion && (
            <Alert severity="warning">
              A origem deixou de estar habilitada para envio. Para retirar o
              evento já aceito, selecione S-3000 e confira o recibo a excluir. O
              cadastro continua preservado.
            </Alert>
          )}
          {source?.needsRectification && !sourceChanged && (
            <Alert severity="info">
              Há alterações neste cadastro desde o último evento aceito. Confira
              a retificação antes de transmitir.
            </Alert>
          )}
          {kind === 'RECTIFICATION' && type !== 'S-3000' && source && (
            <Alert severity="info">
              Este cadastro já possui evento aceito. A retificação usará o
              recibo {source.lastReceipt || 'registrado no último envio aceito'}
              , preservando o evento anterior e a inscrição do empregador desse
              aceite.
            </Alert>
          )}
          <TextField
            label={
              type === 'S-3000'
                ? 'Motivo da exclusão'
                : 'Motivo do envio ou da retificação'
            }
            multiline
            minRows={2}
            value={reason}
            disabled={busy}
            onChange={(e) => setReason(e.target.value)}
          />
          {access.canSendDeclaration && (
            <Button
              variant="outlined"
              disabled={
                busy ||
                !source ||
                sourceChanged ||
                !!source?.needsExclusion ||
                (registrationRequired && !registrationAvailable) ||
                (type !== 'S-3000' && secondarySourceHasNoChanges(source)) ||
                !reason.trim() ||
                (kind === 'RECTIFICATION' && !source?.lastAcceptedDeliveryId)
              }
              onClick={() => void prepare()}
            >
              {type === 'S-3000'
                ? 'Preparar exclusão para conferência'
                : 'Preparar evento para conferência'}
            </Button>
          )}
          {!!overview.data.events.length && (
            <TextField
              {...selectField('preparations')}
              select
              label="Preparações e envios deste tipo"
              value={selectedId}
              disabled={busy}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setError('');
              }}
            >
              <MenuItem value="">Selecione uma preparação</MenuItem>
              {[
                ...overview.data.events,
                ...(event &&
                !overview.data.events.some((item) => item.id === event.id)
                  ? [event]
                  : []),
              ].map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {secondaryPreparationLabel(item)} —{' '}
                  {item.delivery
                    ? declarationDeliveryLabel(item.delivery)
                    : deliveryStateLabel(item.state)}
                </MenuItem>
              ))}
            </TextField>
          )}
        </>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {detail.isError && (
        <Alert severity="error">
          Não foi possível atualizar o resultado desta preparação.{' '}
          <Button onClick={() => detail.refetch()}>Consultar novamente</Button>
        </Alert>
      )}
      {event && (
        <Box
          role="region"
          aria-label="Conferência do evento adicional"
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: '16px',
          }}
        >
          <Stack spacing={8} useFlexGap>
            <Typography variant="subtitle1">
              {secondaryEventLabels[event.type]}
            </Typography>
            <Typography>
              {secondaryDisplayLabel(
                event.source?.label || 'Cadastro de origem',
              )}{' '}
              ·{' '}
              {event.environment === 2
                ? 'Produção restrita'
                : 'Produção oficial'}
            </Typography>
            <Alert
              severity={
                event.delivery?.state === 'ACCEPTED'
                  ? 'success'
                  : event.state === 'BLOCKED' ||
                      event.delivery?.state === 'REJECTED'
                    ? 'warning'
                    : 'info'
              }
            >
              {event.delivery
                ? declarationDeliveryLabel(event.delivery)
                : deliveryStateLabel(event.state)}
            </Alert>
            <LegalDeadlineSummary
              value={event.legalDeadline}
              label="Prazo legal do evento preparado"
            />
            {!!event.diagnostics?.length && (
              <Alert severity="warning">
                <Stack spacing={4}>
                  {event.diagnostics.map((item, index) => (
                    <Typography key={`${item.code}-${index}`} variant="body2">
                      {item.message || diagnosticMessage(item.code)}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            )}
            {!!event.warnings?.length && (
              <Alert severity="info">
                <Stack spacing={4}>
                  {event.warnings.map((warning, index) => (
                    <Typography
                      variant="body2"
                      key={`${warning.code}-${index}`}
                    >
                      {warning.message}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            )}
            <Box
              component="dl"
              aria-label="Resultado do processamento deste evento"
              sx={{
                m: 0,
                p: '16px',
                bgcolor: 'background.paper',
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(3, minmax(0, 1fr))',
                },
                gap: '16px',
              }}
            >
              {[
                ['Protocolo', event.delivery?.protocol || '—'],
                ['Recibo', event.delivery?.receipt || '—'],
                [
                  'Retorno',
                  event.delivery?.errorCode
                    ? deliveryErrorMessage(event.delivery.errorCode)
                    : '—',
                ],
              ].map(([label, value]) => (
                <Box component="div" key={label} sx={{ minWidth: 0 }}>
                  <Typography
                    component="dt"
                    variant="caption"
                    color="text.secondary"
                  >
                    {label}
                  </Typography>
                  <Typography
                    component="dd"
                    variant="body2"
                    sx={{ m: 0, mt: '4px', overflowWrap: 'anywhere' }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={8}
              useFlexGap
            >
              <Button
                variant="outlined"
                disabled={!event.unsignedXml}
                onClick={() => setXml(event.unsignedXml || '')}
              >
                Consultar XML preparado
              </Button>
              {access.canSendInEnvironment(event.environment) && (
                <Button
                  variant="contained"
                  disabled={
                    busy ||
                    !canConfirmSecondary(
                      event,
                      event.environment === 2
                        ? !!overview.data?.environments.restricted
                        : !!overview.data?.environments.production,
                    )
                  }
                  onClick={() => void act('confirm')}
                >
                  {event.type === 'S-3000'
                    ? 'Confirmar exclusão no eSocial'
                    : 'Confirmar transmissão deste evento'}
                </Button>
              )}
              {access.canSendInEnvironment(event.environment) &&
                canCancelSecondary(event) && (
                  <Button disabled={busy} onClick={() => void act('cancel')}>
                    Cancelar tentativa ainda não aceita
                  </Button>
                )}
              {access.canSendInEnvironment(event.environment) &&
                canRetrySecondary(
                  event,
                  event.environment === 2
                    ? !!overview.data?.environments.restricted
                    : !!overview.data?.environments.production,
                ) && (
                  <Button
                    disabled={busy}
                    onClick={() => void act('retry-blocked')}
                  >
                    Retomar após conferir a origem
                  </Button>
                )}
            </Stack>
          </Stack>
        </Box>
      )}
      <Dialog
        open={!!xml}
        onClose={() => setXml('')}
        fullWidth
        maxWidth="md"
        aria-labelledby="secondary-xml-title"
      >
        <DialogTitle id="secondary-xml-title">
          XML preparado para conferência
        </DialogTitle>
        <DialogContent>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: '16px',
              overflow: 'auto',
              fontSize: 12,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
          >
            {xml}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: '16px' }}>
          <Button onClick={() => setXml('')}>Fechar XML</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
