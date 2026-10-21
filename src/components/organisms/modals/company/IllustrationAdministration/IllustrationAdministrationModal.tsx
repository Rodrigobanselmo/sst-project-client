import { PlatformMasterConsumption } from './PlatformMasterConsumption';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  TablePagination,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import SModal, { SModalHeader, SModalPaper } from 'components/molecules/SModal';
import { STable, STableHeader, STableRow } from 'components/atoms/STable';
import { useAccess } from 'core/hooks/useAccess';
import { useAuth } from 'core/contexts/AuthContext';
import { api } from 'core/services/apiClient';
import {
  AdministrationApi,
  Settings,
  adminQueryKey,
  administrationError,
  createIllustrationAdministrationApi,
  generationStatuses,
  periodLabels,
  settingsInput,
  settingsValidation,
  statusLabels,
} from './illustration-administration.api';

const administrationApi = createIllustrationAdministrationApi(api);
const date = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('pt-BR', { timeZone: 'UTC' }) + ' UTC'
    : '—';
const usd = (value?: string | null) =>
  value == null ? 'Não informado' : 'US$ ' + value.replace('.', ',');
function SettingsSummary({ value }: { value: Settings | null }) {
  return value ? (
    <Typography variant="body2">
      {value.enabled ? 'Habilitado' : 'Desabilitado'} · {value.generationLimit}{' '}
      gerações / {periodLabels[value.generationPeriod]} · {usd(value.budgetUsd)}{' '}
      / {periodLabels[value.budgetPeriod]}
    </Typography>
  ) : (
    <Typography variant="body2">Sem configuração anterior</Typography>
  );
}
function QueryError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <Alert
      severity="error"
      action={<Button onClick={retry}>Tentar novamente</Button>}
    >
      {administrationError(error).message}
    </Alert>
  );
}

export function IllustrationAdministrationModal({
  company,
  onClose,
  embedded = false,
  registerCloseGuard,
}: {
  embedded?: boolean;
  registerCloseGuard?: (guard: () => boolean) => () => void;
  company: { id: string; name: string };
  onClose: () => void;
}) {
  const { isMaster } = useAccess();
  if (!isMaster) return null;
  return (
    <AdministrationContent
      key={company.id}
      company={company}
      onClose={onClose}
      embedded={embedded}
      registerCloseGuard={registerCloseGuard}
    />
  );
}
export function AdministrationContent({
  company,
  onClose,
  service = administrationApi,
  embedded = false,
  registerCloseGuard,
}: {
  embedded?: boolean;
  registerCloseGuard?: (guard: () => boolean) => () => void;
  company: { id: string; name: string };
  onClose: () => void;
  service?: AdministrationApi;
}) {
  const { user } = useAuth();
  const cache = useQueryClient();
  const [tab, setTab] = useState(0),
    [form, setForm] = useState<Settings | null>(null),
    [dirty, setDirty] = useState(false),
    [conflict, setConflict] = useState(false),
    [notice, setNotice] = useState(''),
    [saveError, setSaveError] = useState('');
  const [historyPage, setHistoryPage] = useState(0),
    [auditPage, setAuditPage] = useState(0);
  const [filterDraft, setFilterDraft] = useState({
    from: '',
    to: '',
    status: '',
    requestedById: '',
    workspaceId: '',
  });
  const [filters, setFilters] = useState<typeof filterDraft>(filterDraft),
    [filterError, setFilterError] = useState('');
  const key = (kind: string, params?: unknown) =>
    adminQueryKey(company.id, user?.id, kind, params);
  const queryOptions = {
    retry: false as const,
    refetchOnWindowFocus: false,
    cacheTime: 0,
  };
  const settings = useQuery(
    key('settings'),
    () => service.settings(company.id),
    queryOptions,
  );
  useEffect(() => {
    if (settings.data && !dirty && !conflict) setForm(settings.data);
  }, [settings.data, dirty, conflict]);
  const usage = useQuery(key('usage'), () => service.usage(company.id), {
    ...queryOptions,
    enabled: tab === 1,
  });
  const params = useMemo(
    () => ({
      skip: historyPage * 10,
      take: 10,
      ...(filters.from
        ? { from: new Date(filters.from + 'Z').toISOString() }
        : {}),
      ...(filters.to ? { to: new Date(filters.to + 'Z').toISOString() } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.requestedById
        ? { requestedById: Number(filters.requestedById) }
        : {}),
      ...(filters.workspaceId ? { workspaceId: filters.workspaceId } : {}),
    }),
    [filters, historyPage],
  );
  const history = useQuery(
    key('generations', params),
    () => service.history(company.id, params),
    { ...queryOptions, enabled: tab === 1, keepPreviousData: true },
  );
  const auditParams = { skip: auditPage * 10, take: 10 };
  const audit = useQuery(
    key('audit', auditParams),
    () => service.audit(company.id, auditParams),
    { ...queryOptions, enabled: tab === 2, keepPreviousData: true },
  );
  const save = useMutation(
    (value: Settings) => service.save(company.id, settingsInput(value)),
    {
      onSuccess: (persisted) => {
        cache.setQueryData(key('settings'), {
          ...persisted,
          platformMasterAccountingAvailable:
            settings.data?.platformMasterAccountingAvailable,
        });
        setForm(persisted);
        setDirty(false);
        setConflict(false);
        setSaveError('');
        setNotice(
          'Configuração salva. Os valores exibidos foram confirmados pela API.',
        );
        void cache.invalidateQueries({
          predicate: (q) =>
            q.queryKey[0] === 'illustration-administration' &&
            q.queryKey[1] === company.id &&
            q.queryKey[3] !== 'settings',
        });
        void cache.invalidateQueries([
          'characterization-illustration-capabilities',
          company.id,
        ]);
      },
      onError: (error) => {
        const failure = administrationError(error);
        setSaveError(failure.message);
        setConflict(failure.status === 409);
        setNotice('');
      },
    },
  );
  const change = (patch: Partial<Settings>) => {
    setForm((previous) => previous && { ...previous, ...patch });
    setDirty(true);
    setNotice('');
  };
  const canLeave = () =>
    !save.isLoading &&
    (!dirty ||
      window.confirm('Descartar as alterações não salvas desta configuração?'));
  useEffect(
    () => registerCloseGuard?.(canLeave),
    [registerCloseGuard, dirty, save.isLoading],
  );
  const close = () => {
    if (canLeave()) onClose();
  };
  const reload = async () => {
    const result = await settings.refetch();
    if (result.isSuccess && result.data) {
      setForm(result.data);
      setDirty(false);
      setConflict(false);
      setSaveError('');
      setNotice('Configuração atualizada. Revise os valores antes de salvar.');
    }
  };
  const validation = form ? settingsValidation(form) : null;
  const applyFilters = () => {
    if (
      (filterDraft.from &&
        !Number.isFinite(Date.parse(filterDraft.from + 'Z'))) ||
      (filterDraft.to && !Number.isFinite(Date.parse(filterDraft.to + 'Z')))
    ) {
      setFilterError('Informe datas válidas em UTC.');
      return;
    }
    if (
      filterDraft.from &&
      filterDraft.to &&
      filterDraft.from >= filterDraft.to
    ) {
      setFilterError('O fim deve ser posterior ao início (UTC).');
      return;
    }
    if (
      filterDraft.requestedById &&
      (!/^[1-9]\d*$/.test(filterDraft.requestedById) ||
        !Number.isSafeInteger(Number(filterDraft.requestedById)))
    ) {
      setFilterError('Informe um ID de usuário inteiro positivo.');
      return;
    }
    setFilterError('');
    setHistoryPage(0);
    setFilters({ ...filterDraft, workspaceId: filterDraft.workspaceId.trim() });
  };
  const content = (
    <>
      {!embedded && <SModalHeader title="Ilustrações com IA" onClose={close} />}
      <Typography
        id="illustration-administration-title"
        variant="h6"
        sx={{ my: 2 }}
      >
        {company.name}
      </Typography>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        aria-label="Administração de ilustrações"
      >
        <Tab label="Configuração" />
        <Tab label="Consumo e histórico" />
        <Tab label="Alterações" />
        {settings.data?.platformMasterAccountingAvailable && (
          <Tab label="Consumo MASTER da plataforma" />
        )}
      </Tabs>
      <Box role="tabpanel" sx={{ pt: 3 }}>
        {tab === 3 && settings.data?.platformMasterAccountingAvailable && (
          <PlatformMasterConsumption
            key={company.id}
            companyId={company.id}
            actorId={user?.id}
            service={service}
          />
        )}
        {tab === 0 && (
          <>
            {settings.isLoading && (
              <CircularProgress aria-label="Carregando configuração" />
            )}
            {settings.isError && (
              <QueryError
                error={settings.error}
                retry={() => void settings.refetch()}
              />
            )}
            {notice && (
              <Alert severity="success" sx={{ my: 2 }}>
                {notice}
              </Alert>
            )}
            {saveError && (
              <Alert severity="error" sx={{ my: 2 }}>
                {saveError}
              </Alert>
            )}
            {conflict && (
              <Alert
                severity="warning"
                action={
                  <Button
                    disabled={settings.isFetching}
                    onClick={() => void reload()}
                  >
                    Atualizar dados
                  </Button>
                }
              >
                Seu rascunho foi preservado. Atualizar dados substituirá o
                formulário pela configuração atual da API.
              </Alert>
            )}
            {form && !settings.isError && (
              <Box
                component="form"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!validation && !conflict && !save.isLoading)
                    save.mutate(form);
                }}
                sx={{ display: 'grid', gap: 3, mt: 2 }}
              >
                {!form.configured && (
                  <Alert severity="info">
                    Empresa sem configuração. Os valores abaixo são sugestões;
                    nada será habilitado até salvar explicitamente.
                  </Alert>
                )}
                {!form.enabled && (
                  <Alert severity="info">
                    Novas gerações estão desabilitadas. Imagens e prévias
                    existentes mantêm suas regras de acesso.
                  </Alert>
                )}
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.enabled}
                      disabled={save.isLoading}
                      onChange={(e) => change({ enabled: e.target.checked })}
                    />
                  }
                  label="Habilitar geração de ilustrações"
                />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Limite de gerações"
                    type="number"
                    value={
                      Number.isNaN(form.generationLimit)
                        ? ''
                        : form.generationLimit
                    }
                    inputProps={{ min: 0, max: 2147483647, step: 1 }}
                    disabled={save.isLoading}
                    onChange={(e) =>
                      change({
                        generationLimit:
                          e.target.value === '' ? NaN : Number(e.target.value),
                      })
                    }
                  />
                  <TextField
                    select
                    label="Período quantitativo"
                    value={form.generationPeriod}
                    disabled={save.isLoading}
                    onChange={(e) =>
                      change({
                        generationPeriod: e.target
                          .value as Settings['generationPeriod'],
                      })
                    }
                  >
                    {Object.entries(periodLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Orçamento máximo (USD)"
                    value={form.budgetUsd}
                    inputProps={{ inputMode: 'decimal' }}
                    disabled={save.isLoading}
                    helperText="Até 6 casas decimais"
                    onChange={(e) =>
                      change({ budgetUsd: e.target.value.replace(',', '.') })
                    }
                  />
                  <TextField
                    select
                    label="Período financeiro"
                    value={form.budgetPeriod}
                    disabled={save.isLoading}
                    onChange={(e) =>
                      change({
                        budgetPeriod: e.target
                          .value as Settings['budgetPeriod'],
                      })
                    }
                  >
                    {Object.entries(periodLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                <Typography variant="body2">
                  Períodos civis em UTC. A semana começa na segunda-feira; o
                  mês, no dia 1. Alterar limites não apaga o consumo.
                </Typography>
                <Alert severity="info">
                  A autorização dos usuários é feita pelos grupos de acesso,
                  pela permissão “Gerar ilustrações com IA”, junto da permissão
                  de editar a caracterização.
                </Alert>
                {validation && <Alert severity="warning">{validation}</Alert>}
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      save.isLoading ||
                      settings.isFetching ||
                      !!validation ||
                      conflict ||
                      (!dirty && form.configured)
                    }
                  >
                    {save.isLoading ? 'Salvando…' : 'Salvar configuração'}
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
        {tab === 1 && (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              O custo é calculado com o consumo informado pelo provedor. Não
              representa valor faturado ou conciliado pela OpenAI. Reservas
              antigas pendentes continuam comprometendo o orçamento.
            </Alert>
            {usage.isLoading && (
              <CircularProgress aria-label="Carregando consumo" />
            )}
            {usage.isError && (
              <QueryError
                error={usage.error}
                retry={() => void usage.refetch()}
              />
            )}
            {usage.data && !usage.isError && (
              <>
                <Typography variant="body2">
                  Quantidade desde {date(usage.data.quantityPeriodStart)} ·
                  Orçamento desde {date(usage.data.financialPeriodStart)}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                    gap: 2,
                    my: 2,
                  }}
                >
                  {[
                    ['Tentativas utilizadas', String(usage.data.attemptsUsed)],
                    [
                      'Tentativas restantes',
                      String(usage.data.attemptsRemaining),
                    ],
                    [
                      'Custo calculado confirmado',
                      usd(usage.data.confirmedCalculatedCostUsd),
                    ],
                    [
                      'Reservas pendentes',
                      usd(usage.data.pendingReservationsUsd),
                    ],
                    ['Comprometimento total', usd(usage.data.committedUsd)],
                    ['Saldo disponível', usd(usage.data.availableUsd)],
                  ].map(([label, value]) => (
                    <Box
                      key={label}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Typography variant="caption">{label}</Typography>
                      <Typography fontWeight={600}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
                <Typography variant="caption">
                  Reservas de períodos anteriores:{' '}
                  {usd(usage.data.priorPeriodReservationsUsd)} (já incluídas nas
                  reservas pendentes).
                </Typography>
              </>
            )}
            <Box
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                applyFilters();
              }}
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, my: 3 }}
            >
              <TextField
                type="datetime-local"
                label="Início (UTC)"
                InputLabelProps={{ shrink: true }}
                value={filterDraft.from}
                onChange={(e) =>
                  setFilterDraft({ ...filterDraft, from: e.target.value })
                }
              />
              <TextField
                type="datetime-local"
                label="Fim exclusivo (UTC)"
                InputLabelProps={{ shrink: true }}
                value={filterDraft.to}
                onChange={(e) =>
                  setFilterDraft({ ...filterDraft, to: e.target.value })
                }
              />
              <TextField
                select
                label="Status"
                value={filterDraft.status}
                sx={{ minWidth: 170 }}
                onChange={(e) =>
                  setFilterDraft({ ...filterDraft, status: e.target.value })
                }
              >
                <MenuItem value="">Todos</MenuItem>
                {generationStatuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    {statusLabels[s]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="ID do solicitante"
                value={filterDraft.requestedById}
                onChange={(e) =>
                  setFilterDraft({
                    ...filterDraft,
                    requestedById: e.target.value,
                  })
                }
              />
              <TextField
                label="ID do workspace"
                value={filterDraft.workspaceId}
                onChange={(e) =>
                  setFilterDraft({
                    ...filterDraft,
                    workspaceId: e.target.value,
                  })
                }
              />
              <Button type="submit">Aplicar filtros</Button>
              <Button
                onClick={() => {
                  const empty = {
                    from: '',
                    to: '',
                    status: '',
                    requestedById: '',
                    workspaceId: '',
                  };
                  setFilterDraft(empty);
                  setFilters(empty);
                  setHistoryPage(0);
                  setFilterError('');
                }}
              >
                Limpar
              </Button>
            </Box>
            {filterError && <Alert severity="warning">{filterError}</Alert>}
            {history.isError && (
              <QueryError
                error={history.error}
                retry={() => void history.refetch()}
              />
            )}
            <Box sx={{ overflowX: 'auto' }}>
              <STable
                columns="180px 180px 160px 160px minmax(220px,1fr)"
                loading={history.isFetching}
              >
                <STableHeader>
                  {[
                    'Data (UTC)',
                    'Solicitante',
                    'Status',
                    'Custo / reserva',
                    'Rastreabilidade',
                  ].map((label) => (
                    <Typography key={label} fontWeight={600}>
                      {label}
                    </Typography>
                  ))}
                </STableHeader>
                {!history.isError &&
                  history.data?.data.map((row) => (
                    <STableRow key={row.id} px={6} py={3}>
                      <Typography variant="body2">
                        {date(row.createdAt)}
                      </Typography>
                      <Typography variant="body2">
                        {row.requestedBy?.name ||
                          `Usuário ${row.requestedById}`}
                      </Typography>
                      <Typography variant="body2">
                        {statusLabels[row.status] || row.status}
                      </Typography>
                      <Box>
                        <Typography variant="body2">
                          Calculado: {usd(row.confirmedCalculatedCostUsd)}
                        </Typography>
                        <Typography variant="body2">
                          Pendente: {usd(row.pendingReservationUsd)}
                        </Typography>
                      </Box>
                      <Box sx={{ overflowWrap: 'anywhere' }}>
                        <Typography variant="caption" display="block">
                          Geração: {row.id} · Configuração:{' '}
                          {row.settingsVersion ?? 'Anterior ao versionamento'}
                        </Typography>
                        {row.illustration && (
                          <Typography variant="caption" display="block">
                            Aprovação: {date(row.illustration.approvedAt)} ·{' '}
                            {row.illustration.approvedBy?.name ||
                              row.illustration.approvedById}
                          </Typography>
                        )}
                        {row.discardedAt && (
                          <Typography variant="caption" display="block">
                            Descarte: {date(row.discardedAt)} · Usuário{' '}
                            {row.discardedById}
                          </Typography>
                        )}
                        {row.illustration?.deletedAt && (
                          <Typography variant="caption" display="block">
                            Exclusão: {date(row.illustration.deletedAt)} ·
                            Usuário {row.illustration.deletedById}
                          </Typography>
                        )}
                      </Box>
                    </STableRow>
                  ))}
              </STable>
            </Box>
            {!history.isFetching &&
              !history.isError &&
              history.data?.count === 0 && (
                <Typography>Nenhuma geração encontrada.</Typography>
              )}
            <TablePagination
              component="div"
              count={history.data?.count ?? 0}
              page={historyPage}
              onPageChange={(_, page) => setHistoryPage(page)}
              rowsPerPage={10}
              rowsPerPageOptions={[10]}
              getItemAriaLabel={(type) =>
                type === 'next' ? 'Próxima página' : 'Página anterior'
              }
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count}`
              }
              nextIconButtonProps={{
                disabled:
                  history.isFetching ||
                  !history.data ||
                  (historyPage + 1) * 10 >= history.data.count,
              }}
              backIconButtonProps={{
                disabled: history.isFetching || historyPage === 0,
              }}
            />
          </>
        )}
        {tab === 2 && (
          <>
            {audit.isError && (
              <QueryError
                error={audit.error}
                retry={() => void audit.refetch()}
              />
            )}
            <Box sx={{ overflowX: 'auto' }}>
              <STable
                columns="180px 160px minmax(230px,1fr) minmax(230px,1fr) 70px"
                loading={audit.isFetching}
              >
                <STableHeader>
                  {[
                    'Data (UTC)',
                    'MASTER responsável',
                    'Valores anteriores',
                    'Valores novos',
                    'Versão',
                  ].map((label) => (
                    <Typography key={label} fontWeight={600}>
                      {label}
                    </Typography>
                  ))}
                </STableHeader>
                {!audit.isError &&
                  audit.data?.data.map((row) => (
                    <STableRow key={row.id} px={6} py={3}>
                      <Typography variant="body2">
                        {date(row.createdAt)}
                      </Typography>
                      <Typography variant="body2">
                        {row.changedBy?.name || `Usuário ${row.changedById}`}
                      </Typography>
                      <SettingsSummary value={row.before} />
                      <SettingsSummary value={row.after} />
                      <Typography>{row.version}</Typography>
                    </STableRow>
                  ))}
              </STable>
            </Box>
            {!audit.isFetching && !audit.isError && audit.data?.count === 0 && (
              <Typography>
                Nenhuma alteração administrativa registrada.
              </Typography>
            )}
            <TablePagination
              component="div"
              count={audit.data?.count ?? 0}
              page={auditPage}
              onPageChange={(_, page) => setAuditPage(page)}
              rowsPerPage={10}
              rowsPerPageOptions={[10]}
              getItemAriaLabel={(type) =>
                type === 'next' ? 'Próxima página' : 'Página anterior'
              }
              labelRowsPerPage="Por página"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count}`
              }
              nextIconButtonProps={{
                disabled:
                  audit.isFetching ||
                  !audit.data ||
                  (auditPage + 1) * 10 >= audit.data.count,
              }}
              backIconButtonProps={{
                disabled: audit.isFetching || auditPage === 0,
              }}
            />
          </>
        )}
      </Box>
      {!embedded && (
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button disabled={save.isLoading} onClick={close}>
            Fechar
          </Button>
        </Box>
      )}
    </>
  );
  if (embedded)
    return <Box onClick={(event) => event.stopPropagation()}>{content}</Box>;
  return (
    <SModal
      onClick={(event) => event.stopPropagation()}
      open
      onClose={close}
      aria-labelledby="illustration-administration-title"
    >
      <SModalPaper
        sx={{
          width: 'min(1100px,95vw)',
          maxWidth: '1100px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {content}
      </SModalPaper>
    </SModal>
  );
}
