import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Checkbox,
  Box,
  Button,
  MenuItem,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import { useFetch } from '@v2/hooks/api/useFetch';
import { useFetchBrowseHoLaboratories } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchHoCatalogs';
import { useFetchReadHoMethod } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchReadHoMethod';
import {
  browseHoMethods,
  resolveHoMethodDocumentUrl,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.service';
import type { HoMethodRecord } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { HoMethodFormModal } from './HoMethodFormModal';
import { laboratoryRows, laboratoryLimits } from '../utils/ho-laboratory-table';

import STableSearch from 'components/atoms/STable/components/STableSearch';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { tableUtilityPillButtonProps } from 'configs/theme/brand-identity-fill';

async function loadMethods() {
  const methods: HoMethodRecord[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const response = await browseHoMethods({ page, limit: 50 });
    if (!response.results.length && page < response.pagination.totalPages)
      throw new Error('Listagem incompleta');
    methods.push(...response.results);
    totalPages = response.pagination.totalPages;
    page++;
  } while (page <= totalPages);
  return methods;
}
const number = (value: number | null | undefined) =>
  value == null
    ? '—'
    : value.toLocaleString('pt-BR', { maximumFractionDigits: 4 });
const columns = [
  'Agente',
  'CAS',
  'Método',
  'Método analítico',
  'Amostrador',
  'Vazão mín.',
  'Vazão máx.',
  'Volume mín.',
  'Volume máx.',
  'Temperatura',
  'Estabilidade (dias)',
  'Solvente de extração',
  'TWA',
  'STEL',
  'Teto',
  'CMPT / jornada',
  'VMP',
  'Disponibilidade',
  'Confirmação',
  'Documento',
  'Ações',
];

export function HoLaboratoryTable() {
  const [laboratoryId, setLaboratoryId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>(
    {},
  );
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [presence, setPresence] = useState<Record<string, string>>({});
  const [continuous, setContinuous] = useState(false);
  const [tableHeight, setTableHeight] = useState('650');
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const hasDocument = (method: HoMethodRecord) =>
    Boolean(
      method.originalDocumentFileId ||
        method.originalDocumentName ||
        method.originalDocumentUrl,
    );
  useEffect(() => {
    setPage(1);
  }, [laboratoryId, search, selections, presence, pageSize, continuous]);
  const [methodId, setMethodId] = useState('');
  const [editingId, setEditingId] = useState('');
  const labs = useFetchBrowseHoLaboratories();
  const methods = useFetch({
    queryKey: ['ho-laboratory-method-table'],
    queryFn: loadMethods,
    refetchOnMount: true,
  });
  const editing = useFetchReadHoMethod(editingId, Boolean(editingId));
  const selectedId = laboratoryId || labs.data?.[0]?.id || '';
  const allRows = useMemo(
    () => laboratoryRows(methods.data ?? [], selectedId),
    [methods.data, selectedId],
  );
  type Row = ReturnType<typeof laboratoryRows>[number];
  const fields: { key: string; label: string; value: (row: Row) => string }[] =
    [
      {
        key: 'agent',
        label: 'Agentes',
        value: (row) => row.agent.agentName || '—',
      },
      { key: 'cas', label: 'CAS', value: (row) => row.agent.cas || '—' },
      {
        key: 'method',
        label: 'Métodos',
        value: (row) => `${row.method.institution} ${row.method.methodCode}`,
      },
      {
        key: 'source',
        label: 'Instituições / fontes',
        value: (row) => row.method.institution,
      },
      {
        key: 'analytical',
        label: 'Métodos analíticos',
        value: (row) => row.method.analyticalMethod || '—',
      },
      {
        key: 'sampler',
        label: 'Amostradores',
        value: (row) => row.lab.samplerName || row.method.samplerName || '—',
      },
      {
        key: 'solvent',
        label: 'Solventes',
        value: (row) =>
          row.lab.extractionSolventName ||
          row.method.extractionSolventName ||
          '—',
      },
      {
        key: 'availability',
        label: 'Disponibilidade',
        value: (row) =>
          ({
            AVAILABLE: 'Disponível',
            NOT_AVAILABLE: 'Indisponível',
            UNDER_CONSULTATION: 'Em consulta',
            UNKNOWN: 'Desconhecido',
          })[row.lab.availabilityStatus],
      },
      {
        key: 'document',
        label: 'Documento original',
        value: (row) => (hasDocument(row.method) ? 'Anexado' : 'Pendente'),
      },
      {
        key: 'confirmation',
        label: 'Data de confirmação',
        value: (row) =>
          row.lab.lastConfirmationDate
            ?.slice(0, 10)
            .split('-')
            .reverse()
            .join('/') || 'Não informada',
      },
    ];
  const presenceFields: {
    key: string;
    label: string;
    has: (row: Row) => boolean;
  }[] = [
    ...['TWA', 'STEL', 'Teto', 'CMPT / jornada', 'VMP'].map((label, index) => ({
      key: `limit${index}`,
      label: `Limite ${label}`,
      has: (row: Row) => Boolean(laboratoryLimits(row.agent)[index]),
    })),
    ...[
      ['minimumFlowRateOverride', 'minimumFlowRate', 'Vazão mínima'],
      ['maximumFlowRateOverride', 'maximumFlowRate', 'Vazão máxima'],
      ['minimumVolumeOverride', 'minimumVolume', 'Volume mínimo'],
      ['maximumVolumeOverride', 'maximumVolume', 'Volume máximo'],
      ['storageTemperatureOverride', 'storageTemperature', 'Temperatura'],
      ['stabilityDaysOverride', 'stabilityDays', 'Estabilidade'],
    ].map(([labKey, methodKey, label]) => ({
      key: labKey,
      label,
      has: (row: Row) =>
        row.lab[labKey as keyof typeof row.lab] != null ||
        row.method[methodKey as keyof typeof row.method] != null,
    })),
  ];
  const rows = allRows.filter((row) => {
    const text = fields.map((field) => field.value(row)).join(' ');
    return (
      normalize(text).includes(normalize(search.trim())) &&
      fields.every(
        (field) =>
          !selections[field.key]?.length ||
          selections[field.key].includes(field.value(row)),
      ) &&
      presenceFields.every(
        (field) =>
          !presence[field.key] ||
          field.has(row) === (presence[field.key] === 'yes'),
      )
    );
  });
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(rows.length / pageSize)),
  );
  const visibleRows = continuous
    ? rows
    : rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const activeFilters =
    Object.values(selections).filter((values) => values.length).length +
    Object.values(presence).filter(Boolean).length;
  const clearFilters = () => {
    setSelections({});
    setPresence({});
    setPage(1);
  };
  const close = () => {
    setEditingId('');
    void methods.refetch();
  };
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5" color="text.primary">
        Laboratórios — métodos e agentes
      </Typography>
      <Alert severity="info">
        Catálogo compartilhado do SimpleSST. Os parâmetros do laboratório são
        apresentados por agente e método. Vazão e volume de cada avaliação serão
        definidos na estratégia de amostragem. Limites não informados não
        significam ausência de limite.
      </Alert>
      {(labs.isError || methods.isError) && (
        <Alert severity="error">
          Não foi possível carregar o catálogo.{' '}
          <Button
            onClick={() => {
              void labs.refetch();
              void methods.refetch();
            }}
          >
            Tentar novamente
          </Button>
        </Alert>
      )}
      <TextField
        select
        label="Laboratório"
        value={selectedId}
        onChange={(event) => setLaboratoryId(event.target.value)}
        fullWidth
      >
        {(labs.data ?? []).map((lab) => (
          <MenuItem key={lab.id} value={lab.id}>
            {lab.tradeName || lab.corporateName}
            {lab.cnpj ? ` · ${lab.cnpj}` : ''}
          </MenuItem>
        ))}
      </TextField>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
        <TextField
          select
          label="Método para vincular ao laboratório"
          value={methodId}
          onChange={(event) => setMethodId(event.target.value)}
          sx={{ minWidth: 280, flex: 1 }}
        >
          {(methods.data ?? [])
            .filter((method) => method.status === 'ACTIVE')
            .map((method) => (
              <MenuItem key={method.id} value={method.id}>
                {method.displayName}
              </MenuItem>
            ))}
        </TextField>
        <Button
          disabled={!selectedId || !methodId}
          onClick={() => setEditingId(methodId)}
        >
          Vincular / editar método
        </Button>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Para criar ou ajustar um vínculo, abra o método e preencha a seção
        Laboratórios com o laboratório selecionado. O salvamento é o mesmo do
        cadastro de métodos.
      </Typography>
      <STableSearch
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Pesquisar agente, CAS, método, amostrador ou solvente..."
        identitySquareActions
        pinToolbarWithFilter
        mb={2}
        boxProps={{ sx: { minWidth: 250, flex: 1, maxWidth: 550 } }}
        toolbarSx={{ flexWrap: 'wrap', gap: 2 }}
        onReloadClick={() => {
          void methods.refetch();
          void labs.refetch();
        }}
        loadingReload={methods.isFetching || labs.isFetching}
        toolbarBeforeFilter={
          <>
            <STableColumnsButton
              showLabel
              columns={columns
                .slice(0, -1)
                .map((label, index) => ({ label, value: String(index) }))}
              hiddenColumns={hiddenColumns}
              setHiddenColumns={setHiddenColumns}
              tableButtonProps={tableUtilityPillButtonProps}
            />
            <STableFilterButton
              text={activeFilters ? `Filtrar (${activeFilters})` : 'Filtrar'}
              popperTile="Filtros do laboratório"
              tableButtonProps={tableUtilityPillButtonProps}
            >
              <Box
                display="flex"
                flexDirection="column"
                gap={3}
                sx={{
                  width: { xs: 260, sm: 400 },
                  maxHeight: '65vh',
                  overflowY: 'auto',
                  pr: 1,
                }}
              >
                <Typography variant="body2">
                  Selecione várias opções por campo. Campos diferentes são
                  combinados. Os filtros consultam todos os registros do
                  laboratório.
                </Typography>
                {fields.map((field) => (
                  <Autocomplete
                    key={field.key}
                    multiple
                    disableCloseOnSelect
                    options={[...new Set(allRows.map(field.value))].sort(
                      (a, b) => a.localeCompare(b, 'pt-BR'),
                    )}
                    value={selections[field.key] ?? []}
                    onChange={(_, values) =>
                      setSelections((current) => ({
                        ...current,
                        [field.key]: values,
                      }))
                    }
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          checked={selected}
                          sx={{ '&.Mui-checked': { color: 'text.primary' } }}
                        />
                        {option}
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={field.label}
                        placeholder="Todas as opções"
                      />
                    )}
                    noOptionsText="Nenhuma opção"
                    limitTags={2}
                  />
                ))}
                {presenceFields.map((field) => (
                  <TextField
                    key={field.key}
                    select
                    fullWidth
                    label={field.label}
                    value={presence[field.key] ?? ''}
                    onChange={(e) =>
                      setPresence((current) => ({
                        ...current,
                        [field.key]: e.target.value,
                      }))
                    }
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="yes">Com valor informado</MenuItem>
                    <MenuItem value="no">Sem valor informado</MenuItem>
                  </TextField>
                ))}
                <Button onClick={clearFilters}>Limpar filtros</Button>
              </Box>
            </STableFilterButton>
          </>
        }
      />
      {activeFilters > 0 && (
        <Typography variant="body2">
          {activeFilters} filtro(s) aplicado(s){' '}
          <Button onClick={clearFilters}>Limpar filtros</Button>
        </Typography>
      )}
      <Box display="flex" gap={2} flexWrap="wrap">
        <TextField
          select
          label="Exibição"
          value={continuous ? 'all' : 'pages'}
          onChange={(e) => setContinuous(e.target.value === 'all')}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="pages">Paginada</MenuItem>
          <MenuItem value="all">Todos · lista contínua</MenuItem>
        </TextField>
        {continuous && (
          <TextField
            select
            label="Altura da janela da tabela"
            value={tableHeight}
            onChange={(e) => setTableHeight(e.target.value)}
            sx={{ minWidth: 230 }}
          >
            <MenuItem value="400">400 px</MenuItem>
            <MenuItem value="650">650 px</MenuItem>
            <MenuItem value="900">900 px</MenuItem>
            <MenuItem value="auto">Sem limite de altura</MenuItem>
          </TextField>
        )}
        <Typography variant="body2" alignSelf="center">
          {rows.length} de {allRows.length} registros do laboratório
        </Typography>
      </Box>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          overflowX: 'auto',
          maxHeight:
            continuous && tableHeight !== 'auto'
              ? Number(tableHeight)
              : undefined,
          ...Object.fromEntries(
            Object.entries(hiddenColumns)
              .filter(([, hidden]) => hidden)
              .map(([index]) => [
                `& tr > :nth-child(${Number(index) + 1})`,
                { display: 'none' },
              ]),
          ),
        }}
      >
        <Table
          stickyHeader={continuous}
          size="small"
          aria-label="Parâmetros por laboratório, agente e método"
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column} sx={{ whiteSpace: 'nowrap' }}>
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map(({ method, lab, agent }) => {
              const limits = laboratoryLimits(agent);
              return (
                <TableRow key={`${lab.id}:${agent.id}`}>
                  <TableCell sx={{ minWidth: 200 }}>
                    {agent.agentName || 'Agente não informado'}
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    {agent.cas || '—'}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {hasDocument(method) ? (
                      <Link
                        href={resolveHoMethodDocumentUrl(method) ?? undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="always"
                        title="Abrir PDF original do método"
                      >
                        {method.institution} {method.methodCode}
                      </Link>
                    ) : (
                      <>
                        {method.institution} {method.methodCode}
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          PDF pendente
                        </Typography>
                      </>
                    )}
                  </TableCell>
                  <TableCell>{method.analyticalMethod || '—'}</TableCell>
                  <TableCell>
                    {lab.samplerName || method.samplerName || '—'}
                  </TableCell>
                  <TableCell>
                    {number(
                      lab.minimumFlowRateOverride ?? method.minimumFlowRate,
                    )}{' '}
                    {method.flowRateUnit}
                  </TableCell>
                  <TableCell>
                    {number(
                      lab.maximumFlowRateOverride ?? method.maximumFlowRate,
                    )}{' '}
                    {method.flowRateUnit}
                  </TableCell>
                  <TableCell>
                    {number(lab.minimumVolumeOverride ?? method.minimumVolume)}{' '}
                    {method.volumeUnit}
                  </TableCell>
                  <TableCell>
                    {number(lab.maximumVolumeOverride ?? method.maximumVolume)}{' '}
                    {method.volumeUnit}
                  </TableCell>
                  <TableCell>
                    {number(
                      lab.storageTemperatureOverride ??
                        method.storageTemperature,
                    )}{' '}
                    {lab.storageTemperatureUnitOverride ||
                      method.storageTemperatureUnit}
                  </TableCell>
                  <TableCell>
                    {number(lab.stabilityDaysOverride ?? method.stabilityDays)}
                  </TableCell>
                  <TableCell>
                    {lab.extractionSolventName ||
                      method.extractionSolventName ||
                      '—'}
                  </TableCell>
                  {limits.map((limit, index) => (
                    <TableCell
                      key={index}
                      sx={{ minWidth: 150, whiteSpace: 'pre-line' }}
                    >
                      {index === 4 && limit ? (
                        <Tooltip
                          title={
                            <Box sx={{ whiteSpace: 'pre-line' }}>{limit}</Box>
                          }
                          arrow
                        >
                          <Typography
                            component="span"
                            tabIndex={0}
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              cursor: 'help',
                            }}
                          >
                            {limit
                              .split('\n')
                              .map((line) => {
                                const calculation = line.match(/= VMP (.+)$/);
                                return calculation
                                  ? calculation[1]
                                  : line.replace(
                                      /^Condição cadastrada:\s*/,
                                      '',
                                    );
                              })
                              .join('\n')}
                          </Typography>
                        </Tooltip>
                      ) : (
                        limit || '—'
                      )}
                    </TableCell>
                  ))}
                  <TableCell>
                    {
                      {
                        AVAILABLE: 'Disponível',
                        NOT_AVAILABLE: 'Indisponível',
                        UNDER_CONSULTATION: 'Em consulta',
                        UNKNOWN: 'Desconhecido',
                      }[lab.availabilityStatus]
                    }
                  </TableCell>
                  <TableCell>
                    {lab.lastConfirmationDate
                      ?.slice(0, 10)
                      .split('-')
                      .reverse()
                      .join('/') || 'Não informada'}
                  </TableCell>
                  <TableCell>
                    {method.originalDocumentFileId ||
                    method.originalDocumentName ||
                    method.originalDocumentUrl
                      ? 'Anexado'
                      : 'PDF original pendente'}
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => setEditingId(method.id)}>
                      Abrir / editar vínculo
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {!continuous && (
        <STablePagination
          registersPerPage={pageSize}
          totalCountOfRegisters={methods.isLoading ? undefined : rows.length}
          currentPage={currentPage}
          onPageChange={setPage}
          pageSizeOptions={[10, 15, 20, 25, 50, 100]}
          onRegistersPerPageChange={setPageSize}
        />
      )}
      {!methods.isLoading && !methods.isError && !rows.length && (
        <Alert severity="info">
          Nenhum vínculo encontrado para este laboratório e filtro.
        </Alert>
      )}
      {editingId && editing.isLoading && (
        <Typography>Carregando método…</Typography>
      )}
      {editingId && editing.isError && (
        <Alert severity="error">
          Não foi possível abrir o método.{' '}
          <Button onClick={() => setEditingId('')}>Fechar</Button>
        </Alert>
      )}
      <HoMethodFormModal
        open={Boolean(editingId && editing.data)}
        method={editing.data ?? null}
        onClose={close}
      />
    </Box>
  );
}
