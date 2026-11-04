import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import {
  SstDateField,
  useSstDateValidity,
} from '@v2/features/sst-operational/SstDateField';
import {
  accountingError,
  AI_ACCOUNTING_ROOT,
  Attempt,
  fetchAccountingState,
  groupLabels,
  Lookup,
  ReportRow,
  todayInSaoPaulo,
  usd,
  workflowLabels,
} from './api';
import { BudgetSettings, TariffSettings } from './AccountingSettings';

function useLookup(kind: 'company' | 'user', search: string, identity: string) {
  const [debounced, setDebounced] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(search), 250);
    return () => clearTimeout(timer);
  }, [search]);
  return useQuery({
    queryKey: ['ai-accounting', identity, 'lookup', kind, debounced],
    queryFn: async () =>
      (
        await api.get<Lookup[]>(AI_ACCOUNTING_ROOT + '/lookups', {
          params: { kind, q: debounced },
        })
      ).data,
    retry: false,
    enabled: !!identity,
  });
}
const statuses: Record<string, string> = {
  UNKNOWN: 'Consumo não informado',
  SUCCEEDED: 'Consumo registrado',
  REJECTED: 'Recusada pelo provedor',
};
export function AiConsumptionPage() {
  const { user } = useAuth();
  const identity = user ? `${user.companyId}:${user.id}` : '';
  const { datesValid, dateFieldValidity } = useSstDateValidity();
  const [tab, setTab] = useState(0),
    [from, setFrom] = useState(todayInSaoPaulo),
    [to, setTo] = useState(todayInSaoPaulo),
    [group, setGroup] = useState('company');
  const [company, setCompany] = useState(''),
    [actor, setActor] = useState(''),
    [workflow, setWorkflow] = useState(''),
    [companySearch, setCompanySearch] = useState(''),
    [userSearch, setUserSearch] = useState('');
  const companies = useLookup('company', companySearch, identity),
    users = useLookup('user', userSearch, identity);
  const state = useQuery({
    queryKey: ['ai-accounting', identity, 'state'],
    queryFn: fetchAccountingState,
    retry: false,
    enabled: !!identity,
  });
  const params = {
    from,
    to,
    group,
    ...(company ? { companyId: company } : {}),
    ...(actor ? { userId: Number(actor) } : {}),
    ...(workflow ? { workflow } : {}),
  };
  const intervalValid = datesValid && !!from && !!to && from <= to;
  const report = useQuery({
    queryKey: ['ai-accounting', identity, 'report', params],
    queryFn: async () =>
      (
        await api.get<{ data: ReportRow[] }>(AI_ACCOUNTING_ROOT + '/report', {
          params,
        })
      ).data,
    enabled:
      !!identity &&
      state.data?.infrastructureEnabled &&
      intervalValid &&
      tab === 0,
    retry: false,
  });
  const history = useQuery({
    queryKey: ['ai-accounting', identity, 'history', params],
    queryFn: async () =>
      (await api.get<Attempt[]>(AI_ACCOUNTING_ROOT + '/history', { params }))
        .data,
    enabled:
      !!identity &&
      state.data?.infrastructureEnabled &&
      intervalValid &&
      tab === 3,
    retry: false,
  });
  const audit = useQuery({
    queryKey: ['ai-accounting', identity, 'audit'],
    queryFn: async () =>
      (
        await api.get<
          Array<{
            id: string;
            actorUserId: number;
            kind: string;
            target: string;
            createdAt: string;
          }>
        >(AI_ACCOUNTING_ROOT + '/audit')
      ).data,
    enabled: !!identity && state.data?.infrastructureEnabled && tab === 5,
    retry: false,
  });
  const unmetered = useQuery({
    queryKey: ['ai-accounting', identity, 'unmetered'],
    queryFn: async () =>
      (await api.get<Attempt[]>(AI_ACCOUNTING_ROOT + '/unmetered')).data,
    enabled: !!identity && state.data?.infrastructureEnabled && tab === 4,
    retry: false,
  });
  if (state.isPending)
    return <CircularProgress aria-label="Carregando controle de IA" />;
  if (state.isError || !state.data)
    return (
      <Alert
        severity="error"
        action={
          <Button onClick={() => void state.refetch()}>Tentar novamente</Button>
        }
      >
        {accountingError(state.error)}
      </Alert>
    );
  const global = state.data.policies.find((p) => p.scope === 'GLOBAL');
  const error =
    report.error ||
    history.error ||
    unmetered.error ||
    audit.error ||
    companies.error ||
    users.error;
  const attempts = tab === 4 ? unmetered : history;
  const money = (value?: string) =>
    state.data.infrastructureEnabled ? usd(value) : '—';
  const date = (value: string) =>
    new Date(value).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const label = (row: ReportRow) =>
    group === 'company'
      ? row.companyName || row.key
      : group === 'payer'
        ? row.payerName || row.key
        : group === 'user'
          ? row.userName || row.key
          : group === 'workflow'
            ? workflowLabels[row.key] || row.key
            : row.key;
  return (
    <Stack spacing={12} sx={{ py: '24px', minWidth: 0 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={8}
        sx={{ justifyContent: 'space-between', alignItems: { md: 'center' } }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            Consumo de IA
          </Typography>
          <Typography color="text.secondary">
            Custos e limites da plataforma · dia contábil de São Paulo · valores
            em dólares
          </Typography>
        </Box>
        <Button
          onClick={() => {
            void state.refetch();
            if (tab === 0) void report.refetch();
            if (tab === 3) void history.refetch();
            if (tab === 4) void unmetered.refetch();
            if (tab === 5) void audit.refetch();
          }}
        >
          Atualizar
        </Button>
      </Stack>
      {!state.data.infrastructureEnabled && (
        <Alert severity="warning">
          O controle central ainda não está ativo neste ambiente. A ativação
          requer preparar o banco, cadastrar tarifas e definir os limites. O
          consumo anterior não aparece automaticamente neste painel.
        </Alert>
      )}
      {state.data.infrastructureEnabled && global && !global.enabled && (
        <Alert severity="warning">
          Novas chamadas de IA estão pausadas para toda a plataforma. Revise
          tarifas e limites antes de retomar.
        </Alert>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2,minmax(0,1fr))',
            lg: 'repeat(3,minmax(0,1fr))',
          },
          gap: '16px',
        }}
      >
        {(
          [
            ['Contabilizado hoje · toda a plataforma', money(global?.spentUsd)],
            ['Teto diário global', money(global?.limitUsd)],
            ['Saldo diário restante', money(global?.availableUsd)],
          ] as const
        ).map(([title, value]) => (
          <Card key={title} variant="outlined">
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                {title}
              </Typography>
              <Typography variant="h5" sx={{ mt: 5 }}>
                {value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Controle financeiro de IA"
      >
        <Tab label="Consumo" />
        <Tab label="Limites" />
        <Tab label="Tarifas" />
        <Tab label="Chamadas" />
        <Tab label="Sem medição" />
        <Tab label="Alterações" />
      </Tabs>
      {(tab === 0 || tab === 3) && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3,minmax(0,1fr))' },
            gap: '20px',
          }}
        >
          <SstDateField
            label="De"
            value={from}
            onChange={setFrom}
            onValidityChange={dateFieldValidity('from')}
          />
          <SstDateField
            label="Até"
            value={to}
            onChange={setTo}
            onValidityChange={dateFieldValidity('to')}
          />
          {tab === 0 && (
            <TextField
              select
              label="Agrupar por"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {Object.entries(groupLabels).map(([key, title]) => (
                <MenuItem key={key} value={key}>
                  {title}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label="Pesquisar empresa"
            value={companySearch}
            onChange={(e) => setCompanySearch(e.target.value)}
          />
          <TextField
            select
            label="Empresa atendida"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            {companies.data?.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Pesquisar usuário"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <TextField
            select
            label="Usuário"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {users.data?.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Fluxo"
            value={workflow}
            onChange={(e) => setWorkflow(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {Object.entries(workflowLabels).map(([key, title]) => (
              <MenuItem key={key} value={key}>
                {title}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}
      {!intervalValid && (tab === 0 || tab === 3) && (
        <Alert severity="info">Informe um período válido para consultar.</Alert>
      )}
      {error && <Alert severity="error">{accountingError(error)}</Alert>}
      {tab === 0 && (
        <>
          <Alert severity="info">
            O custo é calculado a partir do consumo e da tarifa registrada,
            salvo quando informado diretamente pelo provedor. O limite considera
            apenas o gasto registrado; chamadas em andamento podem
            ultrapassá-lo. Empresa atendida e pagadora são duas visões do mesmo
            gasto; os valores não devem ser somados entre visões.
          </Alert>
          {report.isFetching && (
            <CircularProgress aria-label="Consultando consumo" />
          )}
          <TableContainer>
            <Table size="small" aria-label="Consumo consolidado de IA">
              <TableHead>
                <TableRow>
                  {[
                    groupLabels[group],
                    'Chamadas',
                    'Custo contabilizado',
                    'Sem medição',
                  ].map((title) => (
                    <TableCell key={title}>{title}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {report.data?.data.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell>{label(row)}</TableCell>
                    <TableCell>{row.calls}</TableCell>
                    <TableCell>{usd(row.costUsd)}</TableCell>
                    <TableCell>{row.unmeteredCalls}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {!report.isFetching && !report.data?.data.length && (
            <Typography>
              Nenhum consumo registrado para os filtros selecionados.
            </Typography>
          )}
          {report.data?.data.length === 200 && (
            <Typography variant="body2">
              Exibindo até 200 grupos. Refine os filtros para detalhar.
            </Typography>
          )}
        </>
      )}
      {tab === 1 && (
        <>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={8}>
            <TextField
              label="Pesquisar empresa para configurar limite"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
            />
            <TextField
              label="Pesquisar usuário para configurar limite"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </Stack>
          <BudgetSettings
            state={state.data}
            users={users.data || []}
            companies={companies.data || []}
          />
        </>
      )}
      {tab === 2 && <TariffSettings state={state.data} />}
      {(tab === 3 || tab === 4) && (
        <>
          <Typography variant="body2">
            {tab === 4
              ? 'Até 100 chamadas sem consumo informado, começando pelas mais antigas. Elas não descontam do limite diário e não são consideradas gratuitas.'
              : 'Até 50 chamadas mais recentes no período. Uma ação pode executar várias chamadas internas.'}
          </Typography>
          {attempts.isFetching && (
            <CircularProgress aria-label="Consultando chamadas" />
          )}
          <TableContainer>
            <Table size="small" aria-label="Histórico de chamadas de IA">
              <TableHead>
                <TableRow>
                  {[
                    'Data',
                    'Usuário / rotina',
                    'Empresa atendida',
                    'Fluxo / etapa',
                    'Modelo',
                    'Situação',
                    'Custo contabilizado',
                  ].map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {attempts.data?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{date(row.startedAt)}</TableCell>
                    <TableCell>
                      {row.userName || row.systemActor || row.userId}
                    </TableCell>
                    <TableCell>
                      {row.companyName || row.targetCompanyId}
                    </TableCell>
                    <TableCell>
                      {workflowLabels[row.workflow] || row.workflow}
                      <Typography variant="caption" component="div">
                        {row.stage}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.model}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={statuses[row.status] || row.status}
                        color={row.status === 'UNKNOWN' ? 'warning' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {row.costUsd === null ? 'Sem medição' : usd(row.costUsd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {!attempts.isFetching && !attempts.data?.length && (
            <Typography>
              {tab === 4
                ? 'Nenhuma chamada sem medição.'
                : 'Nenhuma chamada registrada no período.'}
            </Typography>
          )}
        </>
      )}
      {tab === 5 && (
        <>
          <Typography variant="body2">
            Últimas 100 alterações administrativas de limites e tarifas.
          </Typography>
          <TableContainer>
            <Table size="small" aria-label="Histórico de alterações de IA">
              <TableHead>
                <TableRow>
                  {['Data', 'Responsável', 'Alteração', 'Abrangência'].map(
                    (h) => (
                      <TableCell key={h}>{h}</TableCell>
                    ),
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {audit.data?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{date(row.createdAt)}</TableCell>
                    <TableCell>
                      {row.actorUserId === 0
                        ? 'Sistema'
                        : users.data?.find(
                            (u) => u.id === String(row.actorUserId),
                          )?.label || row.actorUserId}
                    </TableCell>
                    <TableCell>
                      {row.kind === 'TARIFF' || row.kind === 'TARIFF_RESET'
                        ? 'Tarifa'
                        : 'Limite'}
                    </TableCell>
                    <TableCell>{row.target}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Stack>
  );
}
