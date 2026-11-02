import { esocialEnvironment } from './environment-model';
import { useEffect, useId, useState } from 'react';
import { useQuery } from 'react-query';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { api } from 'core/services/apiClient';
import { useSstAccess } from './access';
import { EsocialOverview } from './EsocialOverview';
import { DeclarationPanel } from './DeclarationPanel';
import { SecondaryDeclarationPanel } from './SecondaryDeclarationPanel';
import type { SecondaryEventType } from './secondary-delivery-model';
import { civilDateDisplay } from './civil-date';
import { messageOf } from './api';
import {
  portfolioEventSummary,
  portfolioQueryKey,
  portfolioStateLabel,
  portfolioStates,
  portfolioTotals,
  type PortfolioCompany,
  type PortfolioEvent,
  type PortfolioPage,
} from './portfolio-model';

type Selection = {
  companyId: string;
  companyName: string;
  event?: PortfolioEvent;
};
const civil = (value: string | null) =>
  value ? civilDateDisplay(value.slice(0, 10)) : 'Não definida';
const number = (value: number) => value.toLocaleString('pt-BR');

export function EsocialPortfolio() {
  const access = useSstAccess();
  const formId = useId();
  const selectField = (field: string) => ({
    id: `portfolio-${formId}-${field}`,
    SelectProps: {
      SelectDisplayProps: {
        'aria-labelledby': `portfolio-${formId}-${field}-label`,
      },
    },
  });
  const [view, setView] = useState<'companies' | 'events'>('companies');
  const [draftState, setDraft] = useState({
    environment: 2,
    search: '',
    filter: 'ALL',
    family: '',
    state: '',
  });
  const draft = {
    ...draftState,
    environment: esocialEnvironment(
      access.canChooseEnvironment,
      draftState.environment as 1 | 2,
    ),
  };
  const [filterState, setFilters] = useState(draft);
  const filters = {
    ...filterState,
    environment: esocialEnvironment(
      access.canChooseEnvironment,
      filterState.environment as 1 | 2,
    ),
  };
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);
  const [selection, setSelection] = useState<Selection>();
  const [owner, setOwner] = useState(`${access.userId}:${access.companyId}`);
  const identity = `${access.userId}:${access.companyId}`;
  useEffect(() => {
    setOwner(identity);
    setSelection(undefined);
    setCursors([undefined]);
    setDraft({
      environment: 2,
      search: '',
      filter: 'ALL',
      family: '',
      state: '',
    });
    setFilters({
      environment: 2,
      search: '',
      filter: 'ALL',
      family: '',
      state: '',
    });
  }, [identity]);
  const queryFilters =
    view === 'companies'
      ? {
          environment: filters.environment,
          search: filters.search,
          filter: filters.filter,
        }
      : {
          environment: filters.environment,
          search: filters.search,
          family: filters.family,
          state: filters.state,
        };
  const query = portfolioQueryKey(queryFilters, cursors.at(-1));
  const page = useQuery<PortfolioPage>(
    ['esocial-portfolio', identity, view, query],
    async () => (await api.get(`/esocial-portfolio/${view}?${query}`)).data,
    {
      enabled: access.canReadDeclaration && owner === identity,
      retry: false,
      refetchInterval: 10000,
      refetchIntervalInBackground: false,
    },
  );
  if (!access.canReadDeclaration)
    return (
      <Alert severity="warning">
        Sem permissão para consultar o painel eSocial.
      </Alert>
    );
  const companies =
    !page.isError && owner === identity ? page.data?.companies || [] : [];
  const events =
    !page.isError && owner === identity ? page.data?.events || [] : [];
  const openCompany = (c: PortfolioCompany) =>
    setSelection({ companyId: c.id, companyName: c.name });
  const activeSelection = owner === identity ? selection : undefined;
  const apply = () => {
    setFilters({ ...draft, search: draft.search.trim() });
    setCursors([undefined]);
  };
  return (
    <Box sx={{ p: { xs: '16px', md: '24px' }, minWidth: 0 }}>
      <Stack spacing={12} useFlexGap>
        <Typography variant="h5">eSocial · Empresas atendidas</Typography>
        <Typography>
          Consulte sua empresa e as empresas com contrato direto ativo.
          Acompanhe os resultados e abra o envio de todos os empregados da
          empresa escolhida.
        </Typography>
        <Alert severity="info">
          Condições a conferir, preparações e envios são etapas diferentes.
          Abrir ou atualizar este painel não transmite eventos. Alterações de
          vigência continuam sendo resolvidas nos cadastros de origem.
        </Alert>
        <Tabs
          value={view}
          onChange={(_, value) => {
            setView(value);
            setCursors([undefined]);
          }}
          aria-label="Visão do painel eSocial"
        >
          <Tab value="companies" label="Empresas" />
          <Tab value="events" label="Eventos e resultados" />
        </Tabs>
        <Box
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            apply();
          }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3,minmax(0,1fr))' },
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {access.canChooseEnvironment && (
            <TextField
              {...selectField('environment')}
              label="Ambiente do painel"
              select
              value={draft.environment}
              onChange={(e) =>
                setDraft({ ...draft, environment: Number(e.target.value) })
              }
            >
              <MenuItem value={2}>Produção restrita · testes</MenuItem>
              <MenuItem value={1}>Produção</MenuItem>
            </TextField>
          )}
          <TextField
            label="Buscar empresa por nome ou CNPJ"
            value={draft.search}
            inputProps={{ maxLength: 120 }}
            onChange={(e) => setDraft({ ...draft, search: e.target.value })}
          />
          {view === 'companies' ? (
            <TextField
              select
              {...selectField('filter')}
              label="Situação das empresas"
              value={draft.filter}
              onChange={(e) => setDraft({ ...draft, filter: e.target.value })}
            >
              <MenuItem value="ALL">Todas</MenuItem>
              <MenuItem value="ACTION">Com dados a conferir</MenuItem>
              <MenuItem value="ACTIVE">Com processamento em andamento</MenuItem>
              <MenuItem value="ISSUES">
                Com registros de falha ou incerteza
              </MenuItem>
            </TextField>
          ) : (
            <>
              <TextField
                select
                {...selectField('family')}
                label="Tipo de evento"
                value={draft.family}
                onChange={(e) => setDraft({ ...draft, family: e.target.value })}
              >
                <MenuItem value="">Todos os tipos</MenuItem>
                {['S-2240', 'S-2210', 'S-2220', 'S-2221', 'S-3000'].map(
                  (type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ),
                )}
              </TextField>
              <TextField
                select
                {...selectField('state')}
                label="Situação dos eventos"
                value={draft.state}
                onChange={(e) => setDraft({ ...draft, state: e.target.value })}
              >
                <MenuItem value="">Todas as situações</MenuItem>
                {portfolioStates.map((state) => (
                  <MenuItem key={state} value={state}>
                    {portfolioStateLabel(state)}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}
          <Stack direction="row" spacing={8} useFlexGap flexWrap="wrap">
            <Button type="submit" variant="contained">
              Aplicar filtros
            </Button>
            <Button
              disabled={page.isFetching}
              onClick={() => void page.refetch()}
            >
              Atualizar painel
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2">
          Ambiente aplicado:{' '}
          {filters.environment === 2
            ? 'produção restrita (testes)'
            : 'produção'}
          . Página {cursors.length} · até 20 registros por página.{' '}
          {page.dataUpdatedAt
            ? `Atualizado às ${new Date(page.dataUpdatedAt).toLocaleTimeString('pt-BR')}.`
            : ''}
        </Typography>
        {page.isFetching && (
          <Box role="status" aria-label="Atualizando painel">
            <CircularProgress size={20} />
          </Box>
        )}
        {page.isError && (
          <Alert severity="error">
            Não foi possível consultar o painel. {messageOf(page.error)} Os
            dados anteriores não são exibidos como atuais.
          </Alert>
        )}
        {!page.isLoading &&
          !page.isError &&
          !(view === 'companies' ? companies.length : events.length) && (
            <Alert severity="info">
              Nenhum registro encontrado para estes filtros.
            </Alert>
          )}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: view === 'companies' ? 'repeat(2,minmax(0,1fr))' : '1fr',
            },
            gap: '24px',
            minWidth: 0,
          }}
        >
          {companies.map((company) => {
            const totals = portfolioTotals(company);
            return (
              <Box
                component="section"
                aria-label={`Empresa ${company.name}`}
                key={company.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '8px',
                  p: '20px',
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                }}
              >
                <Stack spacing={8} useFlexGap>
                  <Typography variant="h6">{company.name}</Typography>
                  <Typography variant="body2">
                    CNPJ: {company.cnpj || 'não informado'} · Início de envio:{' '}
                    {civil(company.fromDate)}
                  </Typography>
                  <Typography>
                    {number(company.employees)} empregados cadastrados ·{' '}
                    {number(company.unpreparedEmployees)} sem preparação S-2240
                    registrada neste ambiente.
                  </Typography>
                  <Typography>
                    {number(company.preparedEvents)} eventos preparados, ainda
                    não enviados · {number(company.activeRuns)} execuções em
                    acompanhamento.
                  </Typography>
                  <Typography>
                    {number(company.pendingComposition)} condições em
                    conferência · {number(company.sourceReviews)} origens
                    clínicas a conferir.
                  </Typography>
                  {!!company.blockedPreparations && (
                    <Typography color="warning.main">
                      {number(company.blockedPreparations)} preparações com
                      impedimento antes da transmissão.
                    </Typography>
                  )}
                  {company.capturePending && (
                    <Typography variant="body2">
                      Há atualizações aguardando conferência do processamento
                      interno.
                    </Typography>
                  )}
                  <Stack direction="row" spacing={4} useFlexGap flexWrap="wrap">
                    <Chip label={`${number(totals.accepted)} aceitos`} />
                    <Chip label={`${number(totals.processing)} em envio`} />
                    <Chip
                      label={`${number(totals.uncertain)} incertos`}
                      color={totals.uncertain ? 'warning' : 'default'}
                    />
                    <Chip
                      label={`${number(totals.failures)} recusas/impedimentos registrados`}
                    />
                  </Stack>
                  <Button
                    variant="outlined"
                    onClick={() => openCompany(company)}
                  >
                    Abrir acompanhamento desta empresa
                  </Button>
                </Stack>
              </Box>
            );
          })}
          {events.map((event) => (
            <Box
              component="section"
              aria-label={`Evento ${event.family} de ${event.employeeName}`}
              key={`${event.store}:${event.id}`}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '8px',
                p: '20px',
                minWidth: 0,
                overflowWrap: 'anywhere',
              }}
            >
              <Stack spacing={8} useFlexGap>
                <Typography variant="h6">{event.companyName}</Typography>
                <Stack direction="row" spacing={8} flexWrap="wrap" useFlexGap>
                  <Chip label={event.family} />
                  <Chip label={portfolioStateLabel(event.state)} />
                </Stack>
                <Typography>
                  {event.employeeName}
                  {event.matricula ? ` · matrícula ${event.matricula}` : ''}
                </Typography>
                <Typography>{portfolioEventSummary(event)}</Typography>
                <Typography variant="body2">
                  {event.family === 'S-2240'
                    ? 'Início da condição'
                    : 'Data do evento'}
                  : {civil(event.effectiveFrom)} ·{' '}
                  {event.operation === 'RECTIFICATION'
                    ? 'Retificação'
                    : event.family === 'S-3000'
                      ? 'Exclusão'
                      : 'Declaração original'}
                </Typography>
                {event.errorCode && (
                  <Alert severity="warning">
                    Retorno: {event.errorCode}. Confira os detalhes antes de
                    corrigir ou tentar novamente. Resultado incerto não deve ser
                    reenviado.
                  </Alert>
                )}
                {event.receipt && (
                  <Typography variant="body2">
                    Recibo: {event.receipt}
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  onClick={() =>
                    setSelection({
                      companyId: event.companyId,
                      companyName: event.companyName,
                      event,
                    })
                  }
                >
                  Conferir este evento
                </Button>
              </Stack>
            </Box>
          ))}
        </Box>
        <Stack direction="row" spacing={8} useFlexGap>
          <Button
            disabled={cursors.length === 1 || page.isFetching}
            onClick={() => setCursors(cursors.slice(0, -1))}
          >
            Página anterior
          </Button>
          <Button
            disabled={!page.data?.nextCursor || page.isFetching || page.isError}
            onClick={() => setCursors([...cursors, page.data!.nextCursor!])}
          >
            Próxima página
          </Button>
        </Stack>
        <Typography variant="body2">
          As contagens de envios incluem o histórico registrado neste ambiente.
          Um empregado pode gerar mais de um evento. Para transmitir, abra a
          empresa e confirme os envios; não é necessário selecionar grupos de
          100 empregados.
        </Typography>
      </Stack>
      <Dialog
        open={!!activeSelection}
        onClose={() => setSelection(undefined)}
        fullWidth
        maxWidth="xl"
        aria-labelledby="portfolio-company-title"
      >
        <DialogTitle id="portfolio-company-title" sx={{ p: '24px' }}>
          {activeSelection?.companyName}
          {activeSelection?.event
            ? ` · ${activeSelection.event.family}`
            : ' · acompanhamento eSocial'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: '8px', sm: '24px' }, py: '16px' }}>
          {activeSelection &&
            (activeSelection.event ? (
              activeSelection.event.store === 'INITIAL' ? (
                <DeclarationPanel
                  key={activeSelection.event.id}
                  companyId={activeSelection.companyId}
                  initialEnvironment={filters.environment as 1 | 2}
                  requestedRunId={activeSelection.event.preparationId}
                  requestSequence={1}
                />
              ) : (
                <SecondaryDeclarationPanel
                  key={activeSelection.event.id}
                  companyId={activeSelection.companyId}
                  initialSelection={{
                    id: activeSelection.event.preparationId,
                    type: activeSelection.event.family as SecondaryEventType,
                    environment: filters.environment as 1 | 2,
                  }}
                />
              )
            ) : (
              <EsocialOverview
                key={activeSelection.companyId}
                companyId={activeSelection.companyId}
                initialEnvironment={filters.environment as 1 | 2}
              />
            ))}
        </DialogContent>
        <DialogActions sx={{ p: '16px' }}>
          <Button
            onClick={() => {
              setSelection(undefined);
              void page.refetch();
            }}
          >
            Fechar acompanhamento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
