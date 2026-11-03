import { useId, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from 'react-query';
import {
  Alert,
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
import { useSstAccess } from './access';
import { messageOf, sstGet, sstPost } from './api';
import {
  bulkDispatchRunLabel,
  bulkDispatchStateLabel,
  BULK_DISPATCH_FILTERS,
  type BulkDispatchRun,
} from './bulk-dispatch-model';
import {
  secondaryEventLabels,
  type SecondaryEventType,
} from './secondary-delivery-model';
import { DispatchNotificationPanel } from './DispatchNotificationPanel';

const root = '/esocial-events/dispatch/runs';
type Run = BulkDispatchRun & { family: SecondaryEventType };
type Item = {
  id: string;
  sourceId: string;
  sourceLabel: string;
  state: string;
  message?: string;
  errorCode?: string;
  eventId?: string;
  event?: {
    sourceLabel: string;
    employeeLabel?: string;
    kind: string;
    eventOn?: string;
    delivery?: { id: string; state: string; receipt?: string };
  };
};
type Result = { run: Run; items: Item[]; nextCursor?: string };

/** The surrounding declaration form supplies the family, environment and S-1000
 * registration. The batch adds no second clinical editor or historical source. */
export function SecondaryBulkDispatchPanel(props: {
  companyId: string;
  type: SecondaryEventType;
  environment: 1 | 2;
  employerRegistration: string;
  enabled: boolean;
  onOpenEvent: (id: string) => void;
}) {
  const access = useSstAccess();
  return (
    <BatchDraft
      key={`${access.userId}:${access.companyId}:${props.companyId}:${props.type}:${props.environment}`}
      {...props}
    />
  );
}
function BatchDraft({
  companyId,
  type,
  environment,
  employerRegistration,
  enabled,
  onOpenEvent,
}: {
  companyId: string;
  type: SecondaryEventType;
  environment: 1 | 2;
  employerRegistration: string;
  enabled: boolean;
  onOpenEvent: (id: string) => void;
}) {
  const access = useSstAccess(),
    client = useQueryClient(),
    uid = useId();
  const [selected, setSelected] = useState(''),
    [filter, setFilter] = useState(''),
    [ask, setAsk] = useState<'send' | 'cancel' | 'resume' | ''>(''),
    [checked, setChecked] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const attempt = useRef<{ key: string; operationId: string } | null>(null);
  const identity = [
    access.userId,
    access.companyId,
    companyId,
    type,
    environment,
  ];
  const history = useInfiniteQuery<{ runs: Run[]; nextCursor?: string }>(
    ['sst-secondary-dispatch-runs', ...identity],
    ({ pageParam }) =>
      sstGet(
        companyId,
        `${root}?family=${type}${pageParam ? `&cursor=${pageParam}` : ''}`,
      ),
    {
      enabled: access.canReadDeclaration,
      retry: false,
      refetchInterval: 10000,
      getNextPageParam: (page) => page.nextCursor || undefined,
    },
  );
  const historyRows = history.data?.pages.flatMap((page) => page.runs) || [];
  const runId = selected || historyRows[0]?.id || '';
  const detail = useQuery<Result>(
    ['sst-secondary-dispatch-run', ...identity, runId],
    () => sstGet(companyId, `${root}/${runId}`),
    {
      enabled: access.canReadDeclaration && !!runId,
      retry: false,
      refetchInterval: 5000,
    },
  );
  const results = useInfiniteQuery<Result>(
    ['sst-secondary-dispatch-items', ...identity, runId, filter],
    ({ pageParam }) =>
      sstGet(
        companyId,
        `${root}/${runId}?${new URLSearchParams({ ...(pageParam && { cursor: pageParam }), ...(filter && { state: filter }) })}`,
      ),
    {
      enabled: access.canReadDeclaration && !!runId,
      retry: false,
      refetchInterval: 10000,
      getNextPageParam: (page) => page.nextCursor || undefined,
    },
  );
  const run = detail.data?.run;
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries(['sst-secondary-dispatch-runs']),
      client.invalidateQueries(['sst-secondary-dispatch-run']),
      client.invalidateQueries(['sst-secondary-dispatch-items']),
      client.invalidateQueries(['sst-secondary-declarations', companyId]),
      client.invalidateQueries(['sst-secondary-reviews', companyId]),
    ]);
  };
  const execute = async () => {
    if (!checked || busy) return;
    setBusy(true);
    setError('');
    try {
      let result: { run: Run };
      if (ask === 'send') {
        const body = {
          family: type,
          environment,
          ...(type !== 'S-3000' && { employerRegistration }),
          consent:
            type === 'S-3000'
              ? 'SEND_PREPARED_EXCLUSIONS'
              : 'SEND_PENDING_INCLUDING_RECTIFICATIONS',
        };
        const key = JSON.stringify(body);
        if (attempt.current?.key !== key)
          attempt.current = { key, operationId: crypto.randomUUID() };
        result = await sstPost(companyId, root, {
          ...body,
          operationId: attempt.current.operationId,
        });
        attempt.current = null;
      } else
        result = await sstPost(
          companyId,
          `${root}/${runId}/${ask === 'cancel' ? 'cancel-pending' : 'resume'}`,
          {},
        );
      setSelected(result.run.id);
      setFilter('');
      setAsk('');
      setChecked(false);
      await refresh();
    } catch (failure) {
      setError(messageOf(failure));
    } finally {
      setBusy(false);
    }
  };
  const confirm = (action: typeof ask) => {
    setAsk(action);
    setChecked(false);
    setError('');
  };
  const exclusions = type === 'S-3000';
  return (
    <Box
      component="section"
      aria-label={`Envio em massa ${type}`}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        p: '20px',
        my: '16px',
      }}
    >
      <Stack spacing={8} useFlexGap>
        <Typography variant="h6">Envio em massa · {type}</Typography>
        <Typography>
          {exclusions
            ? 'Envia somente as exclusões que você já preparou e conferiu pelo recibo. Nunca seleciona todos os eventos aceitos para excluir.'
            : 'Autorize uma vez. O sistema confere os cadastros desta família e envia as pendências, incluindo correções de origens já aceitas. Um cadastro impedido não bloqueia os demais.'}
        </Typography>
        <Typography variant="body2">
          {environment === 2 ? 'Produção restrita — testes' : 'Produção'} ·{' '}
          {secondaryEventLabels[type]}. Você pode sair desta tela e acompanhar
          depois.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {history.isError && (
          <Alert severity="error">
            Não foi possível carregar as execuções.{' '}
            <Button onClick={() => history.refetch()}>Tentar novamente</Button>
          </Alert>
        )}
        {access.canSendDeclaration && (
          <Button
            variant="contained"
            disabled={
              busy || !enabled || (!exclusions && !employerRegistration)
            }
            onClick={() => confirm('send')}
          >
            {exclusions
              ? 'Enviar exclusões já preparadas'
              : `Enviar pendências ${type} em massa`}
          </Button>
        )}
        {!enabled && (
          <Alert severity="info">
            Transmissão desta família desabilitada neste ambiente.
          </Alert>
        )}
        {!!historyRows.length && (
          <TextField
            select
            id={`secondary-bulk-${uid}`}
            label="Execução desta família"
            value={runId}
            onChange={(e) => {
              setSelected(e.target.value);
              setFilter('');
            }}
            SelectProps={{
              SelectDisplayProps: {
                'aria-labelledby': `secondary-bulk-${uid}-label`,
              },
            }}
          >
            {historyRows.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {bulkDispatchRunLabel(item)}
              </MenuItem>
            ))}
          </TextField>
        )}
        {history.hasNextPage && (
          <Button
            disabled={history.isFetchingNextPage}
            onClick={() => history.fetchNextPage()}
          >
            Carregar execuções anteriores
          </Button>
        )}
        {detail.isError && (
          <Alert severity="error">
            Falha ao consultar esta execução.{' '}
            <Button onClick={() => detail.refetch()}>
              Consultar novamente
            </Button>
          </Alert>
        )}
        {run && (
          <>
            <Typography variant="subtitle1">
              {bulkDispatchStateLabel(run.state)}
            </Typography>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              Execução {run.id}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={
                run.counts.total
                  ? (100 * run.counts.settled) / run.counts.total
                  : 100
              }
              aria-label="Itens concluídos desta execução"
            />
            <Typography>
              Cadastros: {run.counts.total} · Aceitos: {run.counts.accepted} ·{' '}
              Impedidos: {run.counts.blocked} · Recusados: {run.counts.rejected}{' '}
              · Em conferência: {run.counts.unknown} · Sem alterações:{' '}
              {run.counts.noChanges} · Cancelados: {run.counts.cancelled}
            </Typography>
            <Typography variant="body2">
              {run.counts.pending +
                run.counts.preparing +
                run.counts.queued +
                run.counts.processing}{' '}
              aguardando processamento ou resultado. Aceite é individual;
              resultado incerto não conta como concluído.
            </Typography>
            <Stack direction="row" gap="12px" flexWrap="wrap">
              <Button onClick={() => refresh()}>
                Atualizar acompanhamento
              </Button>
              {access.canSendInEnvironment(run.environment) &&
                run.canResume && (
                  <Button onClick={() => confirm('resume')}>
                    Retomar preparações impedidas
                  </Button>
                )}
              {access.canSendInEnvironment(run.environment) &&
                run.canCancel && (
                  <Button color="error" onClick={() => confirm('cancel')}>
                    Cancelar pendências desta execução
                  </Button>
                )}
            </Stack>
            <TextField
              select
              id={`secondary-filter-${uid}`}
              label="Situação dos cadastros"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              SelectProps={{
                SelectDisplayProps: {
                  'aria-labelledby': `secondary-filter-${uid}-label`,
                },
              }}
            >
              {BULK_DISPATCH_FILTERS.filter(
                ([value]) => value !== 'PREPARING',
              ).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            {results.isError && (
              <Alert severity="error">
                Falha ao consultar os itens.{' '}
                <Button onClick={() => results.refetch()}>
                  Tentar novamente
                </Button>
              </Alert>
            )}
            <Stack spacing={8}>
              {results.data?.pages
                .flatMap((page) => page.items)
                .map((item) => (
                  <Box
                    key={item.id}
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      pb: '16px',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    <Typography>
                      {item.event?.employeeLabel ||
                        item.event?.sourceLabel ||
                        item.sourceLabel}
                    </Typography>
                    <Typography variant="body2">
                      {bulkDispatchStateLabel(item.state)}
                      {item.event?.kind === 'RECTIFICATION'
                        ? ' · Retificação'
                        : item.event?.kind === 'EXCLUSION'
                          ? ' · Exclusão'
                          : ''}
                    </Typography>
                    {item.event?.eventOn && (
                      <Typography variant="body2">
                        Data da origem:{' '}
                        {item.event.eventOn
                          .slice(0, 10)
                          .split('-')
                          .reverse()
                          .join('/')}
                      </Typography>
                    )}
                    {item.message && (
                      <Typography variant="body2">{item.message}</Typography>
                    )}
                    {item.event?.delivery?.receipt && (
                      <Typography variant="body2">
                        Recibo: {item.event.delivery.receipt}
                      </Typography>
                    )}
                    {item.eventId && (
                      <Button onClick={() => onOpenEvent(item.eventId!)}>
                        Abrir declaração deste cadastro
                      </Button>
                    )}
                  </Box>
                ))}
            </Stack>
            {results.hasNextPage && (
              <Button
                disabled={results.isFetchingNextPage}
                onClick={() => results.fetchNextPage()}
              >
                Carregar mais cadastros
              </Button>
            )}
          </>
        )}
        <DispatchNotificationPanel
          companyId={companyId}
          runId={runId || undefined}
        />
      </Stack>
      <Dialog
        open={!!ask}
        onClose={() => {
          if (!busy) setAsk('');
        }}
        fullWidth
        maxWidth="sm"
        aria-labelledby={`secondary-confirm-${uid}`}
      >
        <DialogTitle id={`secondary-confirm-${uid}`}>
          {ask === 'cancel'
            ? 'Cancelar somente as pendências?'
            : ask === 'resume'
              ? 'Autorizar nova tentativa das preparações?'
              : `Autorizar envio em massa ${type}?`}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={10} sx={{ pt: '12px' }}>
            <Alert severity={environment === 1 ? 'warning' : 'info'}>
              {environment === 1
                ? 'Esta operação pode transmitir declarações reais em produção.'
                : 'Somente produção restrita — ambiente de testes.'}
            </Alert>
            <Typography>
              {ask === 'cancel'
                ? 'Eventos aceitos e transmissões em andamento permanecem preservados e acompanhados. Cancelar não exclui o que o governo já recebeu.'
                : ask === 'resume'
                  ? 'Somente preparações sem entrega serão refeitas com sua autorização atual. Recusas, bloqueios de entrega e resultados incertos continuam no tratamento individual.'
                  : exclusions
                    ? 'Somente as exclusões já preparadas serão confirmadas. Cada recibo será revalidado; alvos superados ou com dependências ficarão impedidos.'
                    : 'A lista de cadastros é fixada agora. Os dados serão lidos e validados ao preparar cada item. Inclui originais e retificações necessárias; não inclui exclusões automáticas. Datas anteriores ao início de responsabilidade entram somente se houver aceite desta origem para corrigir.'}
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
              }
              label={
                ask === 'cancel'
                  ? 'Confirmo o cancelamento das pendências que ainda podem ser canceladas.'
                  : 'Conferi o escopo e autorizo esta execução para a empresa e o ambiente selecionados.'
              }
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <Button disabled={busy} onClick={() => setAsk('')}>
            Voltar
          </Button>
          <Button
            variant="contained"
            disabled={!checked || busy}
            onClick={() => execute()}
          >
            {busy ? 'Aguarde…' : 'Confirmar execução'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
