import { FC, useCallback, useMemo, useRef, useState } from 'react';

import {
  Alert,
  Box,
  BoxProps,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SIconSortArrowUp } from '@v2/assets/icons/SIconSortArrowUp/SIconSortArrowUp';
import { SIconUnfolderMore } from '@v2/assets/icons/SIconUnfolderMore/SIconUnfolderMore';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { TABLE_PAGE_SIZE_OPTIONS } from '@v2/constants/table-pagination.constants';
import dayjs from 'dayjs';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import { SAuthShow } from 'components/molecules/SAuthShow';
import {
  EpiCaDetailModal,
  epiCaSituationLabel,
} from 'components/molecules/EpiCaDetail';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { SEpiIcon } from 'assets/icons/SEpiIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IEpi } from 'core/interfaces/api/IEpi';
import { useMutUploadCaepi } from 'core/services/hooks/mutations/manager/useMutUploadCaepi';
import { useQueryEpiGovernance } from 'core/services/hooks/queries/useQueryEpiGovernance';
import {
  IQueryEpi,
  useQueryEpis,
} from 'core/services/hooks/queries/useQueryEpis';

import {
  EpiCaColumnId,
  epiCaColumnMap,
  epiCaColumnOrder,
  epiCaColumnPickerItems,
  isEpiCaColumnHidden,
  loadEpiCaHiddenColumns,
  saveEpiCaHiddenColumns,
} from './episAndCaTable.storage';

const PAGE_SIZES = TABLE_PAGE_SIZE_OPTIONS;
const DEFAULT_PAGE_SIZE = 15;

/** Colunas ordenáveis via API (description permanece sem sort). */
type SortField = Exclude<EpiCaColumnId, 'description'>;

type SortState = { field: SortField; order: 'asc' | 'desc' } | null;

type SituationOfficialFilter = '' | 'valido' | 'vencido';
type ValidityFilter = '' | 'valid' | 'expired' | 'none';
type NatureFilter = '' | 'national' | 'imported';
type StatusFilter = '' | StatusEnum;

type LocalFilters = {
  situationOfficial: SituationOfficialFilter;
  validity: ValidityFilter;
  nature: NatureFilter;
  status: StatusFilter;
  manufacturerName: string;
  manufacturerCnpj: string;
  equipment: string;
  brand: string;
  reference: string;
  color: string;
  report: string;
  restriction: string;
  observation: string;
  laboratoryCnpj: string;
  laboratoryName: string;
  reportNumber: string;
  standard: string;
};

const EMPTY_FILTERS: LocalFilters = {
  situationOfficial: '',
  validity: '',
  nature: '',
  status: '',
  manufacturerName: '',
  manufacturerCnpj: '',
  equipment: '',
  brand: '',
  reference: '',
  color: '',
  report: '',
  restriction: '',
  observation: '',
  laboratoryCnpj: '',
  laboratoryName: '',
  reportNumber: '',
  standard: '',
};

function buildSearchQuery(search: string): IQueryEpi {
  const term = search.trim();
  if (!term) return {};
  if (/^\d+$/.test(term)) return { ca: term };
  return { equipment: term };
}

function buildApiQuery(
  search: string,
  filters: LocalFilters,
  sort: SortState,
): IQueryEpi {
  const query: IQueryEpi = {
    ...buildSearchQuery(search),
  };

  if (filters.situationOfficial) {
    query.situationOfficial = filters.situationOfficial;
  }
  if (filters.validity) query.validity = filters.validity;
  if (filters.nature === 'national') query.national = true;
  if (filters.nature === 'imported') query.national = false;
  if (filters.status) query.status = filters.status;

  const assignContains = (key: keyof IQueryEpi, value: string) => {
    const trimmed = value.trim();
    if (trimmed) (query as Record<string, string>)[key as string] = trimmed;
  };

  assignContains('manufacturerName', filters.manufacturerName);
  assignContains('manufacturerCnpj', filters.manufacturerCnpj);
  assignContains('brand', filters.brand);
  assignContains('reference', filters.reference);
  assignContains('color', filters.color);
  assignContains('report', filters.report);
  assignContains('restriction', filters.restriction);
  assignContains('observation', filters.observation);
  assignContains('laboratoryCnpj', filters.laboratoryCnpj);
  assignContains('laboratoryName', filters.laboratoryName);
  assignContains('reportNumber', filters.reportNumber);
  assignContains('standard', filters.standard);

  // Filtro de equipamento sobrescreve a busca global textual por equipamento
  if (filters.equipment.trim()) {
    query.equipment = filters.equipment.trim();
  }

  if (sort) {
    query.orderBy = sort.field;
    query.order = sort.order;
  }

  return query;
}

function situationLabel(epi: IEpi) {
  return epiCaSituationLabel(epi);
}

const SortableHeader: FC<{
  label: string;
  field: SortField;
  sort: SortState;
  onSort: (field: SortField) => void;
}> = ({ label, field, sort, onSort }) => {
  const direction = sort?.field === field ? sort.order : undefined;
  return (
    <STableHRow
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
      }}
      onClick={() => onSort(field)}
    >
      {label}
      {!direction && <SIconUnfolderMore />}
      {direction === 'desc' && <SIconSortArrowUp color="primary.main" />}
      {direction === 'asc' && <SIconSortArrowDown color="primary.main" />}
    </STableHRow>
  );
};

export const EpisAndCaTable: FC<{ children?: any } & BoxProps> = () => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<SortState>(null);
  const [selected, setSelected] = useState<IEpi | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<
    Partial<Record<EpiCaColumnId, boolean>>
  >(() => loadEpiCaHiddenColumns());
  const [filters, setFilters] = useState<LocalFilters>(EMPTY_FILTERS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const governanceQuery = useQueryEpiGovernance();
  const uploadCaepi = useMutUploadCaepi();
  const isUploading = uploadCaepi.isLoading;

  const query = useMemo(
    () => buildApiQuery(search, filters, sort),
    [search, filters, sort],
  );
  const {
    data,
    count,
    isLoading,
    isError,
  } = useQueryEpis(Math.max(0, page - 1), query, pageSize);

  const patchFilters = (patch: Partial<LocalFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const visibleColumns = useMemo(() => {
    return epiCaColumnOrder
      .filter((id) => !isEpiCaColumnHidden(id, hiddenColumns))
      .map((id) => {
        const def = epiCaColumnMap[id];
        const sortable: SortField | null =
          id === 'description' ? null : (id as SortField);
        return {
          id,
          text: def.label,
          column: def.column,
          field: sortable,
        };
      });
  }, [hiddenColumns]);

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!(PAGE_SIZES as readonly number[]).includes(size as any)) return;
      setPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const onSort = useCallback(
    (field: SortField) => {
      setSort((prev) => {
        if (prev?.field !== field) return { field, order: 'asc' };
        if (prev.order === 'asc') return { field, order: 'desc' };
        return null;
      });
      setPage(1);
    },
    [setPage],
  );

  const setHiddenColumnsFromPicker = useCallback(
    (next: Record<EpiCaColumnId, boolean>) => {
      setHiddenColumns(next);
      saveEpiCaHiddenColumns(next);
    },
    [],
  );

  const governance = governanceQuery.data;
  const updatedLabel = governance?.updatedAt
    ? dayjs(governance.updatedAt).format('DD/MM/YYYY')
    : 'não disponível';

  const chips = useMemo(() => {
    const list: {
      key: string;
      leftLabel: string;
      label: string;
      onDelete: () => void;
    }[] = [];

    const pushText = (
      key: keyof LocalFilters,
      leftLabel: string,
      value: string,
    ) => {
      const trimmed = value.trim();
      if (!trimmed) return;
      list.push({
        key,
        leftLabel,
        label: trimmed,
        onDelete: () => patchFilters({ [key]: '' } as Partial<LocalFilters>),
      });
    };

    if (filters.situationOfficial) {
      list.push({
        key: 'situationOfficial',
        leftLabel: 'Situação',
        label: filters.situationOfficial === 'valido' ? 'VÁLIDO' : 'VENCIDO',
        onDelete: () => patchFilters({ situationOfficial: '' }),
      });
    }
    if (filters.validity) {
      const labels: Record<Exclude<ValidityFilter, ''>, string> = {
        valid: 'Válidos',
        expired: 'Vencidos',
        none: 'Sem validade',
      };
      list.push({
        key: 'validity',
        leftLabel: 'Validade',
        label: labels[filters.validity],
        onDelete: () => patchFilters({ validity: '' }),
      });
    }
    if (filters.nature) {
      list.push({
        key: 'nature',
        leftLabel: 'Natureza',
        label: filters.nature === 'national' ? 'Nacional' : 'Importado',
        onDelete: () => patchFilters({ nature: '' }),
      });
    }
    if (filters.status) {
      list.push({
        key: 'status',
        leftLabel: 'Status',
        label: filters.status,
        onDelete: () => patchFilters({ status: '' }),
      });
    }

    pushText('manufacturerName', 'Fabricante', filters.manufacturerName);
    pushText('manufacturerCnpj', 'CNPJ fabricante', filters.manufacturerCnpj);
    pushText('equipment', 'Equipamento', filters.equipment);
    pushText('brand', 'Marca', filters.brand);
    pushText('reference', 'Referência', filters.reference);
    pushText('color', 'Cor', filters.color);
    pushText('report', 'Aprovado para laudo', filters.report);
    pushText('restriction', 'Restrição', filters.restriction);
    pushText('observation', 'Observação', filters.observation);
    pushText('laboratoryCnpj', 'CNPJ laboratório', filters.laboratoryCnpj);
    pushText('laboratoryName', 'Laboratório', filters.laboratoryName);
    pushText('reportNumber', 'Nº laudo', filters.reportNumber);
    pushText('standard', 'Norma', filters.standard);

    return list;
    // patchFilters is stable enough via setState; chips only depend on filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const renderCell = (id: EpiCaColumnId, row: IEpi) => {
    switch (id) {
      case 'ca':
        return <TextIconRow key="ca" text={row.ca} />;
      case 'equipment':
        return <TextIconRow key="equipment" text={row.equipment || '—'} />;
      case 'description':
        return <TextIconRow key="description" text={row.description || '—'} />;
      case 'situation':
        return <TextIconRow key="situation" text={situationLabel(row)} />;
      case 'expiredDate':
        return (
          <TextIconRow
            key="expiredDate"
            text={
              row.expiredDate
                ? dayjs(row.expiredDate).format('DD/MM/YYYY')
                : '—'
            }
          />
        );
      case 'national':
        return (
          <TextIconRow
            key="national"
            text={row.national ? 'Nacional' : 'Importado'}
          />
        );
      case 'status':
        return (
          <TextIconRow key="status" text={row.status || StatusEnum.ACTIVE} />
        );
      case 'processNumber':
        return (
          <TextIconRow key="processNumber" text={row.processNumber || '—'} />
        );
      case 'manufacturerName':
        return (
          <TextIconRow
            key="manufacturerName"
            text={row.manufacturerName || '—'}
          />
        );
      case 'manufacturerCnpj':
        return (
          <TextIconRow
            key="manufacturerCnpj"
            text={row.manufacturerCnpj || '—'}
          />
        );
      case 'brand':
        return <TextIconRow key="brand" text={row.brand || '—'} />;
      case 'reference':
        return <TextIconRow key="reference" text={row.reference || '—'} />;
      case 'color':
        return <TextIconRow key="color" text={row.color || '—'} />;
      case 'report':
        return <TextIconRow key="report" text={row.report || '—'} />;
      case 'restriction':
        return <TextIconRow key="restriction" text={row.restriction || '—'} />;
      case 'observation':
        return <TextIconRow key="observation" text={row.observation || '—'} />;
      case 'laboratoryCnpj':
        return (
          <TextIconRow key="laboratoryCnpj" text={row.laboratoryCnpj || '—'} />
        );
      case 'laboratoryName':
        return (
          <TextIconRow key="laboratoryName" text={row.laboratoryName || '—'} />
        );
      case 'reportNumber':
        return (
          <TextIconRow key="reportNumber" text={row.reportNumber || '—'} />
        );
      case 'standard':
        return <TextIconRow key="standard" text={row.standard || '—'} />;
      default:
        return null;
    }
  };

  return (
    <>
      <STableTitle icon={SEpiIcon}>EPIs e Certificados de Aprovação</STableTitle>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 720 }}>
        Consulta da base de Equipamentos de Proteção Individual e Certificados
        de Aprovação (CA) importada do sistema CAEPI/MTE.
      </Typography>

      <Box
        sx={{
          mb: 4,
          p: 3,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Base CAEPI
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Última atualização: <strong>{updatedLabel}</strong>
          {governance?.version != null ? ` · Versão ${governance.version}` : ''}
          {governance?.totalCount != null
            ? ` · ${governance.totalCount.toLocaleString('pt-BR')} registros`
            : ''}
        </Typography>
        {governance?.isStale && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            A base de EPIs/CA pode estar desatualizada. Recomenda-se atualizar a
            base oficial CAEPI/MTE.
          </Alert>
        )}

        <SAuthShow roles={[RoleEnum.MASTER]}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Importe o arquivo oficial CAEPI/MTE (RelatorioCA_*.xlsx). A
            operação pode levar alguns minutos em bases com mais de 100 mil
            registros.
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file || isUploading) return;
              uploadCaepi.mutate(file);
            }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={
              isUploading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SUploadIcon sx={{ fontSize: 18 }} />
              )
            }
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Importando base CAEPI…' : 'Importar base CAEPI'}
          </Button>
          {isUploading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Importação em andamento. Não feche esta página — bases oficiais
              grandes podem levar vários minutos.
            </Alert>
          )}
        </SAuthShow>
      </Box>

      <STableSearch
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder="Pesquisar por CA ou equipamento"
        toolbarBeforeFilter={
          <Box display="flex" alignItems="center" gap={1}>
            <STableColumnsButton<EpiCaColumnId>
              showLabel
              columns={epiCaColumnPickerItems}
              hiddenColumns={
                hiddenColumns as Record<EpiCaColumnId, boolean>
              }
              setHiddenColumns={setHiddenColumnsFromPicker}
            />
            <STableFilterButton text="Filtrar">
              <Box
                display="flex"
                flexDirection="column"
                gap={2}
                width={320}
                maxHeight={420}
                overflow="auto"
                pr={1}
              >
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Certificado
                </Typography>
                <FormControl size="small" fullWidth>
                  <InputLabel>Situação oficial</InputLabel>
                  <Select
                    label="Situação oficial"
                    value={filters.situationOfficial}
                    onChange={(e) =>
                      patchFilters({
                        situationOfficial: e.target
                          .value as SituationOfficialFilter,
                      })
                    }
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="valido">VÁLIDO</MenuItem>
                    <MenuItem value="vencido">VENCIDO</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel>Validade</InputLabel>
                  <Select
                    label="Validade"
                    value={filters.validity}
                    onChange={(e) =>
                      patchFilters({
                        validity: e.target.value as ValidityFilter,
                      })
                    }
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="valid">Válidos</MenuItem>
                    <MenuItem value="expired">Vencidos</MenuItem>
                    <MenuItem value="none">Sem validade</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel>Natureza</InputLabel>
                  <Select
                    label="Natureza"
                    value={filters.nature}
                    onChange={(e) =>
                      patchFilters({ nature: e.target.value as NatureFilter })
                    }
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="national">Nacional</MenuItem>
                    <MenuItem value="imported">Importado</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel>Status interno</InputLabel>
                  <Select
                    label="Status interno"
                    value={filters.status}
                    onChange={(e) =>
                      patchFilters({ status: e.target.value as StatusFilter })
                    }
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value={StatusEnum.ACTIVE}>ACTIVE</MenuItem>
                    <MenuItem value={StatusEnum.INACTIVE}>INACTIVE</MenuItem>
                  </Select>
                </FormControl>

                <Divider />
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Fabricante
                </Typography>
                <TextField
                  size="small"
                  label="Fabricante / Razão social"
                  value={filters.manufacturerName}
                  onChange={(e) =>
                    patchFilters({ manufacturerName: e.target.value })
                  }
                  placeholder="Ex.: 3M"
                />
                <TextField
                  size="small"
                  label="CNPJ fabricante"
                  value={filters.manufacturerCnpj}
                  onChange={(e) =>
                    patchFilters({ manufacturerCnpj: e.target.value })
                  }
                />

                <Divider />
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Equipamento
                </Typography>
                <TextField
                  size="small"
                  label="Equipamento"
                  value={filters.equipment}
                  onChange={(e) => patchFilters({ equipment: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Marca"
                  value={filters.brand}
                  onChange={(e) => patchFilters({ brand: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Referência"
                  value={filters.reference}
                  onChange={(e) => patchFilters({ reference: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Cor"
                  value={filters.color}
                  onChange={(e) => patchFilters({ color: e.target.value })}
                />

                <Divider />
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Laudo / norma
                </Typography>
                <TextField
                  size="small"
                  label="Aprovado para laudo"
                  value={filters.report}
                  onChange={(e) => patchFilters({ report: e.target.value })}
                />
                <TextField
                  size="small"
                  label="Restrição"
                  value={filters.restriction}
                  onChange={(e) =>
                    patchFilters({ restriction: e.target.value })
                  }
                />
                <TextField
                  size="small"
                  label="Observação"
                  value={filters.observation}
                  onChange={(e) =>
                    patchFilters({ observation: e.target.value })
                  }
                />
                <TextField
                  size="small"
                  label="CNPJ laboratório"
                  value={filters.laboratoryCnpj}
                  onChange={(e) =>
                    patchFilters({ laboratoryCnpj: e.target.value })
                  }
                />
                <TextField
                  size="small"
                  label="Laboratório"
                  value={filters.laboratoryName}
                  onChange={(e) =>
                    patchFilters({ laboratoryName: e.target.value })
                  }
                />
                <TextField
                  size="small"
                  label="Nº laudo"
                  value={filters.reportNumber}
                  onChange={(e) =>
                    patchFilters({ reportNumber: e.target.value })
                  }
                  placeholder="Ex.: REAT-054-2022"
                />
                <TextField
                  size="small"
                  label="Norma"
                  value={filters.standard}
                  onChange={(e) => patchFilters({ standard: e.target.value })}
                  placeholder="Ex.: ABNT"
                />

                <Typography variant="caption" color="text.disabled">
                  Filtros textuais usam “contém” e são aplicados no servidor
                  antes da paginação (total e páginas refletem o resultado
                  filtrado).
                </Typography>
              </Box>
            </STableFilterButton>
          </Box>
        }
      />

      {chips.length > 0 && (
        <STableInfoSection>
          <STableFilterChipList onClean={clearFilters}>
            {chips.map((chip) => (
              <STableFilterChip
                key={chip.key}
                leftLabel={chip.leftLabel}
                leftLabelBold
                label={chip.label}
                onDelete={chip.onDelete}
              />
            ))}
          </STableFilterChipList>
        </STableInfoSection>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar a lista de EPIs. Tente novamente.
        </Alert>
      )}

      <STable
        loading={isLoading}
        columns={visibleColumns.map((h) => h.column).join(' ')}
        rowsNumber={pageSize}
      >
        <STableHeader>
          {visibleColumns.map((h) =>
            h.field ? (
              <SortableHeader
                key={h.id}
                label={h.text}
                field={h.field}
                sort={sort}
                onSort={onSort}
              />
            ) : (
              <STableHRow key={h.id}>{h.text}</STableHRow>
            ),
          )}
        </STableHeader>
        <STableBody<IEpi>
          rowsData={data}
          hideLoadMore
          rowsInitialNumber={pageSize}
          contentEmpty="Nenhum EPI encontrado para a busca informada."
          renderRow={(row) => (
            <STableRow
              key={row.id}
              onClick={() => setSelected(row)}
              clickable
            >
              {visibleColumns.map((col) => renderCell(col.id, row))}
            </STableRow>
          )}
        />
      </STable>

      <STablePagination
        mt={2}
        registersPerPage={pageSize}
        totalCountOfRegisters={isLoading ? undefined : count}
        currentPage={page}
        onPageChange={setPage}
        pageSizeOptions={[...PAGE_SIZES]}
        onRegistersPerPageChange={onRegistersPerPageChange}
      />

      <EpiCaDetailModal
        epi={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
};
