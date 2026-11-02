import { esocialEnvironment } from './environment-model';
import { useId, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DispatchNotificationPanel } from './DispatchNotificationPanel';
import { useModal } from 'core/hooks/useModal';
import { ModalEnum } from 'core/enums/modal.enums';
import { useSstAccess } from './access';
import { sstGet, sstPost, messageOf } from './api';
import type { DeclarationOverview } from './delivery-model';
import {
  BULK_DISPATCH_FILTERS,
  bulkDispatchItemMessage,
  bulkDispatchItems,
  bulkDispatchProgress,
  bulkDispatchRequestKey,
  bulkDispatchRunLabel,
  bulkDispatchStateLabel,
  type BulkDispatchItemPage,
  type BulkDispatchRun,
  type BulkDispatchRunPage,
} from './bulk-dispatch-model';

const route = '/esocial-dispatch/runs';
const dateTime = (value: string) => new Date(value).toLocaleString('pt-BR');
const countLabel = (value: number) => value.toLocaleString('pt-BR');

/** One explicit consent for the cohort. Progress belongs to the server, not this tab. */
export function BulkDispatchPanel({
  companyId,
  onOpenDeclaration,
  initialEnvironment = 2,
}: {
  companyId: string;
  onOpenDeclaration?: (runId: string) => void;
  initialEnvironment?: 1 | 2;
}) {
  const access = useSstAccess();
  const { onStackOpenModal } = useModal();
  const client = useQueryClient();
  const controlId = useId();
  const [selectedEnvironment, setEnvironment] = useState<1 | 2>(
    initialEnvironment,
  );
  const environment = esocialEnvironment(
    access.canChooseEnvironment,
    selectedEnvironment,
  );
  const [registration, setRegistration] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const [busy, setBusy] = useState(false);
  const [cancelAsked, setCancelAsked] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const attempt = useRef<{ key: string; operationId: string } | null>(null);
  const selectProps = (name: string) => ({
    id: `bulk-dispatch-${controlId}-${name}`,
    SelectProps: {
      SelectDisplayProps: {
        'aria-labelledby': `bulk-dispatch-${controlId}-${name}-label`,
      },
    },
  });
  const overview = useQuery<DeclarationOverview>(
    ['sst-declarations', companyId, ''],
    () => sstGet(companyId, '/esocial-initial/2240'),
    { enabled: access.canReadDeclaration, retry: false },
  );
  const history = useInfiniteQuery<BulkDispatchRunPage>(
    ['sst-dispatch-runs', companyId],
    ({ pageParam }) =>
      sstGet(
        companyId,
        `${route}${pageParam ? `?cursor=${encodeURIComponent(pageParam)}` : ''}`,
      ),
    {
      enabled: access.canReadDeclaration,
      retry: false,
      refetchInterval: false,
      getNextPageParam: (page) => page.nextCursor || undefined,
    },
  );
  const runs = [
    ...new Map(
      (history.data?.pages || [])
        .flatMap((page) => page.runs)
        .map((run) => [run.id, run]),
    ).values(),
  ];
  const runId = selectedId || runs[0]?.id || '';
  const detail = useQuery<{ run: BulkDispatchRun }>(
    ['sst-dispatch-run', companyId, runId],
    () => sstGet(companyId, `${route}/${runId}`),
    {
      enabled: access.canReadDeclaration && !!runId,
      retry: false,
      refetchInterval: 5000,
    },
  );
  const run = detail.data?.run || runs.find((item) => item.id === runId);
  const cursor = cursors[cursors.length - 1];
  const results = useQuery<BulkDispatchItemPage>(
    ['sst-dispatch-items', companyId, runId, stateFilter, cursor || ''],
    () => {
      const params = new URLSearchParams();
      if (cursor) params.set('cursor', cursor);
      if (stateFilter) params.set('state', stateFilter);
      return sstGet(
        companyId,
        `${route}/${runId}/items${params.size ? `?${params}` : ''}`,
      );
    },
    {
      enabled: access.canReadDeclaration && !!runId,
      retry: false,
      refetchInterval: 5000,
    },
  );
  const items = bulkDispatchItems(results.data ? [results.data] : []);
  const employerRegistration =
    registration || overview.data?.employerRegistration || '';
  const registrationOptions = overview.data?.employerRegistrationOptions || [];
  const enabled =
    environment === 2
      ? overview.data?.environments.restricted
      : overview.data?.environments.production;
  const validRegistration = registrationOptions.includes(employerRegistration);
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries(['sst-dispatch-runs', companyId]),
      client.invalidateQueries(['sst-dispatch-run', companyId]),
      client.invalidateQueries(['sst-dispatch-items', companyId]),
      client.invalidateQueries(['sst-declarations', companyId]),
      client.invalidateQueries(['sst-operational-health', companyId]),
    ]);
  };
  const start = async () => {
    if (busy || !enabled || !validRegistration) return;
    const key = bulkDispatchRequestKey({
      companyId,
      environment,
      employerRegistration,
    });
    if (attempt.current?.key !== key)
      attempt.current = { key, operationId: crypto.randomUUID() };
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await sstPost(companyId, route, {
        operationId: attempt.current.operationId,
        environment,
        employerRegistration,
        selection: 'CURRENT',
        consent: 'SEND_PENDING',
      });
      const created: BulkDispatchRun = response.run || response;
      setSelectedId(created.id);
      setStateFilter('');
      setCursors([undefined]);
      setCancelAsked(false);
      attempt.current = null;
      setNotice(
        'Execução recebida. O acompanhamento continua mesmo se você sair desta tela.',
      );
      await refresh();
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };
  const act = async (action: 'cancel-pending' | 'resume') => {
    if (!run || busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await sstPost(companyId, `${route}/${run.id}/${action}`, {});
      setCancelAsked(false);
      setCursors([undefined]);
      setNotice(
        action === 'resume'
          ? 'A retomada foi solicitada. Aceites e resultados incertos não serão reenviados.'
          : 'O cancelamento das pendências foi solicitado. Envios já iniciados e recibos continuam em acompanhamento.',
      );
      await refresh();
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };
  if (!access.canReadDeclaration) return null;
  return (
    <Box
      role="region"
      aria-label="Envio S-2240 de todos os empregados"
      sx={{
        p: '16px',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack spacing={8} useFlexGap>
        <Typography variant="h6">
          Condições ambientais de todos os empregados
        </Typography>
        <Typography variant="body2">
          Envie as pendências S-2240 de toda a empresa, sem selecionar os
          empregados um a um. CAT, ASO e toxicológico continuam nos seus painéis
          de envio.
        </Typography>
        <Typography variant="body2">
          Serão usados os dados válidos na preparação de cada empregado;
          cadastros incluídos depois ficam para a próxima execução. Você pode
          sair da tela.
        </Typography>
        {access.canSendDeclaration && (
          <>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={8}
              useFlexGap
            >
              {access.canChooseEnvironment && (
                <TextField
                  {...selectProps('environment')}
                  select
                  fullWidth
                  label="Ambiente do envio de todos os empregados"
                  value={environment}
                  disabled={busy}
                  onChange={(event) =>
                    setEnvironment(Number(event.target.value) as 1 | 2)
                  }
                >
                  <MenuItem value={2}>Produção restrita — testes</MenuItem>
                  <MenuItem value={1}>Produção — envio oficial</MenuItem>
                </TextField>
              )}
              <TextField
                {...selectProps('registration')}
                select
                fullWidth
                label="Inscrição S1000 para todos os empregados"
                value={employerRegistration}
                disabled={busy}
                onChange={(event) => setRegistration(event.target.value)}
                helperText="Confira a mesma inscrição do empregador usada no eSocial."
              >
                {!validRegistration && (
                  <MenuItem value="">Selecione a inscrição cadastrada</MenuItem>
                )}
                {registrationOptions.map((value) => (
                  <MenuItem key={value} value={value}>
                    {value} ·{' '}
                    {value.length === 8 ? 'raiz do CNPJ' : 'CNPJ completo'}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Alert severity={environment === 1 ? 'warning' : 'info'}>
              {environment === 1
                ? 'Ao confirmar, você autoriza a transmissão oficial das pendências S-2240 desta empresa.'
                : 'Ao confirmar, você autoriza o envio S-2240 no ambiente de testes. Isso não é uma declaração em produção.'}{' '}
              Os dados obrigatórios serão conferidos; itens bloqueados não
              impedem o envio dos demais. Não haverá uma confirmação separada
              para cada empregado.
            </Alert>
            {overview.isError && (
              <Alert severity="error">
                Não foi possível conferir a configuração de envio.{' '}
                <Button onClick={() => overview.refetch()}>
                  Consultar configuração novamente
                </Button>
              </Alert>
            )}
            {overview.data && !enabled && (
              <Alert severity="warning">
                A transmissão não está habilitada neste ambiente. Você pode
                continuar consultando as execuções existentes.
              </Alert>
            )}
            <Button
              variant="contained"
              disabled={
                busy ||
                !overview.data ||
                overview.isError ||
                !enabled ||
                !validRegistration
              }
              onClick={() => void start()}
            >
              {busy
                ? 'Registrando solicitação…'
                : environment === 1
                  ? 'Confirmar envio S-2240 de todos os empregados em produção'
                  : 'Confirmar envio S-2240 de todos os empregados para testes'}
            </Button>
          </>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {notice && <Alert severity="success">{notice}</Alert>}
        {history.isLoading && <Typography>Consultando execuções…</Typography>}
        {history.isError && (
          <Alert severity="warning">
            Não foi possível atualizar o histórico das execuções.{' '}
            <Button onClick={() => history.refetch()}>
              Consultar execuções novamente
            </Button>
          </Alert>
        )}
        {!!runs.length && (
          <TextField
            {...selectProps('run')}
            select
            fullWidth
            label="Execuções de todos os empregados"
            value={runId}
            disabled={busy}
            onChange={(event) => {
              setSelectedId(event.target.value);
              setStateFilter('');
              setCursors([undefined]);
              setCancelAsked(false);
            }}
          >
            {runs.map((item) => (
              <MenuItem
                key={item.id}
                value={item.id}
                sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}
              >
                {bulkDispatchRunLabel(item)}
              </MenuItem>
            ))}
          </TextField>
        )}
        {history.hasNextPage && (
          <Button
            disabled={history.isFetching}
            onClick={() => history.fetchNextPage()}
          >
            Carregar execuções anteriores
          </Button>
        )}
        {run && (
          <Box role="region" aria-label="Andamento da execução S-2240">
            <Stack spacing={8} useFlexGap>
              <Typography variant="subtitle1">
                {bulkDispatchStateLabel(run.state)} ·{' '}
                {run.environment === 2
                  ? 'Produção restrita — testes'
                  : 'Produção'}
              </Typography>
              {run.snapshotOn && (
                <Typography variant="body2">
                  Data de referência das condições:{' '}
                  {new Date(run.snapshotOn).toLocaleDateString('pt-BR', {
                    timeZone: 'UTC',
                  })}
                  .
                </Typography>
              )}
              <Typography variant="body2">
                {countLabel(run.counts.settled)} de{' '}
                {countLabel(run.counts.total)} empregados com resultado final
                nesta execução.
              </Typography>
              <LinearProgress
                variant="determinate"
                value={bulkDispatchProgress(run.counts)}
                aria-label="Progresso dos empregados da execução"
              />
              <Stack direction="row" spacing={8} useFlexGap flexWrap="wrap">
                {(
                  [
                    ['accepted', 'aceitos'],
                    ['pending', 'aguardando conferência'],
                    ['preparing', 'em preparação'],
                    ['queued', 'aguardando transmissão'],
                    ['processing', 'aguardando resultado'],
                    ['blocked', 'com informações para corrigir'],
                    ['rejected', 'rejeitados'],
                    ['noChanges', 'sem alterações'],
                    ['cancelled', 'pendências canceladas'],
                    ['unknown', 'resultados em conferência'],
                  ] as const
                ).map(([key, label]) => (
                  <Chip
                    key={key}
                    label={`${countLabel(run.counts[key])} ${label}`}
                    variant="outlined"
                    color={key === 'accepted' ? 'success' : 'default'}
                  />
                ))}
              </Stack>
              <Typography variant="body2">
                Resultado em conferência não é aceite nem rejeição. Corrija
                impedimentos no cadastro de origem e solicite a retomada quando
                estiver disponível.
              </Typography>
              {run.updatedAt && (
                <Typography variant="caption" color="text.secondary">
                  Atualizado em {dateTime(run.updatedAt)}. O acompanhamento é
                  salvo no sistema.
                </Typography>
              )}
              {detail.isError && (
                <Alert severity="warning">
                  Não foi possível atualizar este andamento. Os dados anteriores
                  foram mantidos.{' '}
                  <Button onClick={() => detail.refetch()}>
                    Atualizar andamento
                  </Button>
                </Alert>
              )}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={8}
                useFlexGap
              >
                <Button disabled={busy} onClick={() => void refresh()}>
                  Atualizar execução
                </Button>
                {access.canSendInEnvironment(run.environment) &&
                  run.canResume && (
                    <Button disabled={busy} onClick={() => void act('resume')}>
                      Retomar itens disponíveis
                    </Button>
                  )}
                {access.canSendInEnvironment(run.environment) &&
                  run.canCancel && (
                    <Button
                      disabled={busy}
                      onClick={() => setCancelAsked(true)}
                    >
                      Cancelar somente pendências
                    </Button>
                  )}
              </Stack>
              {cancelAsked && (
                <Alert severity="warning">
                  Somente os itens que ainda podem ser cancelados serão
                  interrompidos. Resultados incertos, envios já iniciados e
                  recibos serão preservados.
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={8}
                    sx={{ mt: '16px' }}
                  >
                    <Button
                      disabled={busy}
                      onClick={() => void act('cancel-pending')}
                    >
                      Confirmar cancelamento das pendências
                    </Button>
                    <Button
                      disabled={busy}
                      onClick={() => setCancelAsked(false)}
                    >
                      Continuar acompanhando
                    </Button>
                  </Stack>
                </Alert>
              )}
              <TextField
                {...selectProps('filter')}
                select
                fullWidth
                label="Situação dos empregados nesta execução"
                value={stateFilter}
                onChange={(event) => {
                  setStateFilter(event.target.value);
                  setCursors([undefined]);
                }}
              >
                {BULK_DISPATCH_FILTERS.map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              {results.isLoading && (
                <Typography>
                  Consultando os resultados dos empregados…
                </Typography>
              )}
              {results.isError && (
                <Alert severity="warning">
                  Não foi possível atualizar esta página de resultados.{' '}
                  <Button onClick={() => results.refetch()}>
                    Consultar resultados novamente
                  </Button>
                </Alert>
              )}
              {!results.isLoading && !results.isError && !items.length && (
                <Typography>
                  Nenhum empregado nesta situação na consulta carregada.
                </Typography>
              )}
              <Stack
                spacing={8}
                role="list"
                aria-label="Resultados dos empregados da execução"
              >
                {items.map((item) => (
                  <Box
                    key={item.id}
                    role="listitem"
                    sx={{
                      p: '16px',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    <Stack spacing={4}>
                      <Typography variant="subtitle2">
                        {item.employeeName || 'Empregado da execução'}
                        {item.matricula ? ` · Matrícula ${item.matricula}` : ''}
                      </Typography>
                      <Typography variant="body2">
                        {bulkDispatchStateLabel(item.state)}
                      </Typography>
                      {bulkDispatchItemMessage(item) && (
                        <Typography variant="body2">
                          {bulkDispatchItemMessage(item)}
                        </Typography>
                      )}
                      {item.eventCount !== undefined && (
                        <Typography variant="body2">
                          {item.eventCount === 0
                            ? 'Nenhum evento gerado para este empregado.'
                            : `Eventos aceitos: ${item.acceptedEvents || 0} de ${item.eventCount}.`}
                        </Typography>
                      )}
                      {item.receipt && (
                        <Typography variant="body2">
                          Recibo: {item.receipt}
                        </Typography>
                      )}
                      {item.initialRunId && onOpenDeclaration && (
                        <Button
                          onClick={() => onOpenDeclaration(item.initialRunId!)}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          Ver declaração e retorno
                        </Button>
                      )}
                      {access.canReadStructure('Hierarchy') && (
                        <Button
                          onClick={() =>
                            onStackOpenModal(ModalEnum.EMPLOYEES_ADD, {
                              id: item.employeeId,
                              companyId,
                            })
                          }
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          Consultar cadastro do empregado
                        </Button>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={8}
                useFlexGap
                alignItems={{ sm: 'center' }}
              >
                <Typography variant="body2">
                  Página {cursors.length} · {items.length}{' '}
                  {items.length === 1 ? 'empregado' : 'empregados'} nesta
                  página.
                </Typography>
                <Button
                  disabled={results.isFetching || cursors.length === 1}
                  onClick={() => setCursors((current) => current.slice(0, -1))}
                >
                  Página anterior de empregados
                </Button>
                <Button
                  disabled={results.isFetching || !results.data?.nextCursor}
                  onClick={() => {
                    const next = results.data?.nextCursor;
                    if (next) setCursors((current) => [...current, next]);
                  }}
                >
                  Próxima página de empregados
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
        <DispatchNotificationPanel
          companyId={companyId}
          runId={runId || undefined}
        />
      </Stack>
    </Box>
  );
}
