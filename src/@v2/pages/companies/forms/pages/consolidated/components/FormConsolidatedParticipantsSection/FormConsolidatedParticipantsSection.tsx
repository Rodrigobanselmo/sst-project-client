import { useMemo, useState } from 'react';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
  Alert,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import {
  buildConsolidatedCompanyAggregates,
  buildConsolidatedHierarchyAggregates,
  buildConsolidatedParticipantsFilterSummary,
  buildConsolidatedParticipantsRecorteSnapshot,
  buildConsolidatedSectorAggregates,
  buildConsolidatedWorkspaceAggregates,
  CONSOLIDATED_PARTICIPANTS_PRIVACY_MIN_SIZE,
  ConsolidatedParticipantsFilters,
  ConsolidatedParticipantsViewMode,
  filterConsolidatedParticipants,
  getConsolidatedParticipantWorkspaceLabel,
  maskConsolidatedParticipantForPrivacy,
  shouldProtectConsolidatedParticipantGroup,
} from '@v2/models/enterprise/company-group/consolidated-view-participants.helpers';
import { useFetchConsolidatedViewParticipants } from '@v2/services/enterprise/company-group/consolidated-view/hooks/useFetchConsolidatedViewParticipants';
import { FormParticipantsFilterSummary } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormParticipantsTable/components/FormParticipantsFilterSummary';
import SText from 'components/atoms/SText';

import { ConsolidatedParticipantsGroupedTable } from './ConsolidatedParticipantsGroupedTable';

const CONSOLIDATED_FETCH_LIMIT = 10_000;
const LIST_PAGE_SIZE = 50;

const VIEW_MODE_OPTIONS: Array<{
  value: ConsolidatedParticipantsViewMode;
  label: string;
}> = [
  { value: 'list', label: 'Lista detalhada' },
  { value: 'grouped_company', label: 'Agrupado por empresa' },
  { value: 'grouped_workspace', label: 'Agrupado por estabelecimento' },
  { value: 'grouped_sector', label: 'Agrupado por setor' },
  { value: 'grouped_hierarchy', label: 'Agrupado por hierarquia' },
];

type ResponseFilter = ConsolidatedParticipantsFilters['responseFilter'];

type Props = {
  companyGroupId: number;
  applicationIds: string[];
};

type FilterOption = {
  id: string;
  label: string;
};

export function FormConsolidatedParticipantsSection({
  companyGroupId,
  applicationIds,
}: Props) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [responseFilter, setResponseFilter] = useState<ResponseFilter>('all');
  const [companyIds, setCompanyIds] = useState<string[]>([]);
  const [workspaceLabels, setWorkspaceLabels] = useState<string[]>([]);
  const [sectorLabels, setSectorLabels] = useState<string[]>([]);
  const [viewMode, setViewMode] =
    useState<ConsolidatedParticipantsViewMode>('list');
  const [page, setPage] = useState(1);

  const { participantsData, isLoading, isError } =
    useFetchConsolidatedViewParticipants(
      {
        companyGroupId,
        applicationIds,
        page: 1,
        limit: CONSOLIDATED_FETCH_LIMIT,
      },
      { enabled: companyGroupId > 0 && applicationIds.length >= 2 },
    );

  const allParticipants = participantsData?.participants ?? [];

  const filters = useMemo<ConsolidatedParticipantsFilters>(
    () => ({
      search,
      responseFilter,
      companyIds,
      workspaceLabels,
      sectorLabels,
    }),
    [companyIds, responseFilter, search, sectorLabels, workspaceLabels],
  );

  const filteredParticipants = useMemo(
    () => filterConsolidatedParticipants(allParticipants, filters),
    [allParticipants, filters],
  );

  const filterSummary = useMemo(
    () => buildConsolidatedParticipantsFilterSummary(filteredParticipants),
    [filteredParticipants],
  );

  const shouldMaskListPii = shouldProtectConsolidatedParticipantGroup(
    filterSummary.totalParticipants,
  );

  const companyOptions = useMemo<FilterOption[]>(() => {
    const map = new Map<string, string>();

    for (const participant of allParticipants) {
      map.set(participant.companyId, participant.companyLabel);
    }

    return [...map.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((left, right) => left.label.localeCompare(right.label, 'pt-BR'));
  }, [allParticipants]);

  const workspaceOptions = useMemo<FilterOption[]>(() => {
    const labels = new Set<string>();

    for (const participant of allParticipants) {
      labels.add(getConsolidatedParticipantWorkspaceLabel(participant));
    }

    return [...labels]
      .sort((left, right) => left.localeCompare(right, 'pt-BR'))
      .map((label) => ({ id: label, label }));
  }, [allParticipants]);

  const sectorOptions = useMemo<FilterOption[]>(() => {
    const labels = new Set<string>();

    for (const participant of allParticipants) {
      labels.add(participant.sectorLabel || '—');
    }

    return [...labels]
      .sort((left, right) => left.localeCompare(right, 'pt-BR'))
      .map((label) => ({ id: label, label }));
  }, [allParticipants]);

  const groupedRows = useMemo(() => {
    switch (viewMode) {
      case 'grouped_company':
        return buildConsolidatedCompanyAggregates(filteredParticipants);
      case 'grouped_workspace':
        return buildConsolidatedWorkspaceAggregates(filteredParticipants);
      case 'grouped_sector':
        return buildConsolidatedSectorAggregates(filteredParticipants);
      case 'grouped_hierarchy':
        return buildConsolidatedHierarchyAggregates(filteredParticipants);
      default:
        return [];
    }
  }, [filteredParticipants, viewMode]);

  const paginatedParticipants = useMemo(() => {
    const offset = (page - 1) * LIST_PAGE_SIZE;
    return filteredParticipants
      .slice(offset, offset + LIST_PAGE_SIZE)
      .map((participant) =>
        maskConsolidatedParticipantForPrivacy(participant, shouldMaskListPii),
      );
  }, [filteredParticipants, page, shouldMaskListPii]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredParticipants.length / LIST_PAGE_SIZE),
  );

  const recorteSnapshot = useMemo(
    () =>
      buildConsolidatedParticipantsRecorteSnapshot({
        filters,
        viewMode,
        filterSummary,
        participants: filteredParticipants,
        groups: groupedRows,
      }),
    [filteredParticipants, filterSummary, filters, groupedRows, viewMode],
  );

  if (isLoading) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (isError || !participantsData) {
    return (
      <Alert severity="error">
        Não foi possível carregar os participantes consolidados.
      </Alert>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <FormParticipantsFilterSummary summary={filterSummary} />

      {shouldMaskListPii && (
        <Alert severity="info">
          O recorte filtrado possui menos de {CONSOLIDATED_PARTICIPANTS_PRIVACY_MIN_SIZE}{' '}
          participantes. Dados individualizados foram ocultados para preservar o
          sigilo.
        </Alert>
      )}

      <SPaper shadow={false} sx={{ p: 2 }}>
        <SFlex align="center" gap={2} flexWrap="wrap" mb={2}>
          <TextField
            size="small"
            placeholder="Buscar por nome, CPF, e-mail, empresa..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                setPage(1);
                setSearch(searchInput.trim());
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 280, flex: 1 }}
          />

          <ToggleButtonGroup
            size="small"
            exclusive
            value={responseFilter}
            onChange={(_, value: ResponseFilter | null) => {
              if (!value) return;
              setResponseFilter(value);
              setPage(1);
            }}
          >
            <ToggleButton value="all">Todos</ToggleButton>
            <ToggleButton value="responded">Responderam</ToggleButton>
            <ToggleButton value="not_responded">Não responderam</ToggleButton>
          </ToggleButtonGroup>
        </SFlex>

        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }}
          gap={2}
          mb={2}
        >
          <Autocomplete
            multiple
            size="small"
            options={companyOptions}
            getOptionLabel={(option) => option.label}
            value={companyOptions.filter((option) =>
              companyIds.includes(option.id),
            )}
            onChange={(_, value) => {
              setCompanyIds(value.map((item) => item.id));
              setPage(1);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Empresa de origem" />
            )}
          />
          <Autocomplete
            multiple
            size="small"
            options={workspaceOptions}
            getOptionLabel={(option) => option.label}
            value={workspaceOptions.filter((option) =>
              workspaceLabels.includes(option.id),
            )}
            onChange={(_, value) => {
              setWorkspaceLabels(value.map((item) => item.id));
              setPage(1);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Estabelecimento" />
            )}
          />
          <Autocomplete
            multiple
            size="small"
            options={sectorOptions}
            getOptionLabel={(option) => option.label}
            value={sectorOptions.filter((option) =>
              sectorLabels.includes(option.id),
            )}
            onChange={(_, value) => {
              setSectorLabels(value.map((item) => item.id));
              setPage(1);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Setor" />
            )}
          />
        </Box>

        <FormControl fullWidth size="small" sx={{ maxWidth: 420, mb: 2 }}>
          <InputLabel id="consolidated-participants-view-mode">
            Modo de visualização
          </InputLabel>
          <Select
            labelId="consolidated-participants-view-mode"
            label="Modo de visualização"
            value={viewMode}
            onChange={(event) => {
              setViewMode(event.target.value as ConsolidatedParticipantsViewMode);
              setPage(1);
            }}
          >
            {VIEW_MODE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {viewMode === 'list' ? (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>CPF</TableCell>
                    <TableCell>E-mail</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Empresa</TableCell>
                    <TableCell>Estabelecimento</TableCell>
                    <TableCell>Setor</TableCell>
                    <TableCell>Hierarquia</TableCell>
                    <TableCell>Cargo</TableCell>
                    <TableCell align="center">Resposta</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedParticipants.map((participant) => (
                    <TableRow
                      key={`${participant.applicationId}:${participant.participantId}`}
                      hover
                    >
                      <TableCell>
                        <SText fontSize={13} fontWeight={500}>
                          {participant.name}
                        </SText>
                      </TableCell>
                      <TableCell>{participant.cpf || '—'}</TableCell>
                      <TableCell>{participant.email || '—'}</TableCell>
                      <TableCell>{participant.phone || '—'}</TableCell>
                      <TableCell>
                        <SText fontSize={12} lineNumber={2}>
                          {participant.companyLabel}
                        </SText>
                      </TableCell>
                      <TableCell>
                        {getConsolidatedParticipantWorkspaceLabel(participant)}
                      </TableCell>
                      <TableCell>{participant.sectorLabel || '—'}</TableCell>
                      <TableCell>
                        <SText fontSize={12} lineNumber={2}>
                          {participant.hierarchyLabel || '—'}
                        </SText>
                      </TableCell>
                      <TableCell>{participant.officeLabel || '—'}</TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={
                            participant.hasAnswered ? 'Respondido' : 'Pendente'
                          }
                          color={
                            participant.hasAnswered ? 'success' : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedParticipants.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <SText fontSize={13} color="text.secondary" py={2}>
                          Nenhum participante encontrado para os filtros
                          selecionados.
                        </SText>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <SFlex align="center" justify="space-between" mt={2}>
              <SText fontSize={12} color="text.secondary">
                Página {page} de {totalPages} · {filteredParticipants.length}{' '}
                participantes no recorte
              </SText>
              <SFlex gap={1}>
                <Chip
                  label="Anterior"
                  size="small"
                  variant="outlined"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1}
                  sx={{ cursor: page <= 1 ? 'default' : 'pointer' }}
                />
                <Chip
                  label="Próxima"
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages}
                  sx={{ cursor: page >= totalPages ? 'default' : 'pointer' }}
                />
              </SFlex>
            </SFlex>
          </>
        ) : (
          <ConsolidatedParticipantsGroupedTable
            title={
              VIEW_MODE_OPTIONS.find((option) => option.value === viewMode)
                ?.label || 'Agrupamento'
            }
            labelColumn={
              viewMode === 'grouped_company'
                ? 'Empresa'
                : viewMode === 'grouped_workspace'
                  ? 'Estabelecimento'
                  : viewMode === 'grouped_sector'
                    ? 'Setor'
                    : 'Hierarquia'
            }
            aggregates={groupedRows}
          />
        )}

        <Box
          aria-hidden
          sx={{ display: 'none' }}
          data-consolidated-participants-recorte={JSON.stringify(
            recorteSnapshot,
          )}
        />

        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          Visão analítica read-only. Agrupamentos demográficos por perguntas de
          identificação serão adicionados quando houver compatibilidade
          estrutural entre as aplicações consolidadas.
        </Typography>
      </SPaper>
    </Box>
  );
}
