import { FC, useCallback, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  BoxProps,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
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
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { SEpiIcon } from 'assets/icons/SEpiIcon';
import SUploadIcon from 'assets/icons/SUploadIcon';

import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { IEpi } from 'core/interfaces/api/IEpi';
import { useQueryEpiGovernance } from 'core/services/hooks/queries/useQueryEpiGovernance';
import {
  IQueryEpi,
  useQueryEpis,
} from 'core/services/hooks/queries/useQueryEpis';

import {
  EpiCaColumnId,
  epiCaColumnPickerItems,
  loadEpiCaHiddenColumns,
  saveEpiCaHiddenColumns,
} from './episAndCaTable.storage';

const PAGE_SIZES = TABLE_PAGE_SIZE_OPTIONS;
const DEFAULT_PAGE_SIZE = 15;

const IMPORT_DISABLED_MESSAGE =
  'Importação da base oficial CAEPI será habilitada após adequação do cadastro aos campos oficiais do MTE.';

type SortField =
  | 'ca'
  | 'equipment'
  | 'situation'
  | 'expiredDate'
  | 'national'
  | 'status';

type SortState = { field: SortField; order: 'asc' | 'desc' } | null;

type SituationFilter = '' | 'valid' | 'expired' | 'expired_sheet';
type NatureFilter = '' | 'national' | 'imported';
type StatusFilter = '' | StatusEnum;

type LocalFilters = {
  situation: SituationFilter;
  nature: NatureFilter;
  status: StatusFilter;
};

function buildEpiQuery(search: string): IQueryEpi {
  const term = search.trim();
  if (!term) return {};
  if (/^\d+$/.test(term)) return { ca: term };
  return { equipment: term };
}

function situationLabel(epi: IEpi) {
  if (epi.isValid === false) return 'Vencido (planilha)';
  if (epi.expiredDate && dayjs(epi.expiredDate).isBefore(dayjs())) {
    return 'Vencido';
  }
  return 'Válido';
}

function situationKey(epi: IEpi): Exclude<SituationFilter, ''> {
  if (epi.isValid === false) return 'expired_sheet';
  if (epi.expiredDate && dayjs(epi.expiredDate).isBefore(dayjs())) {
    return 'expired';
  }
  return 'valid';
}

function compareEpis(a: IEpi, b: IEpi, field: SortField): number {
  switch (field) {
    case 'ca':
      return String(a.ca || '').localeCompare(String(b.ca || ''), 'pt-BR', {
        numeric: true,
      });
    case 'equipment':
      return String(a.equipment || '').localeCompare(
        String(b.equipment || ''),
        'pt-BR',
        { sensitivity: 'base' },
      );
    case 'situation':
      return situationLabel(a).localeCompare(situationLabel(b), 'pt-BR');
    case 'expiredDate': {
      const ta = a.expiredDate ? dayjs(a.expiredDate).valueOf() : 0;
      const tb = b.expiredDate ? dayjs(b.expiredDate).valueOf() : 0;
      return ta - tb;
    }
    case 'national':
      return Number(Boolean(a.national)) - Number(Boolean(b.national));
    case 'status':
      return String(a.status || '').localeCompare(String(b.status || ''), 'pt-BR');
    default:
      return 0;
  }
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
  const [filters, setFilters] = useState<LocalFilters>({
    situation: '',
    nature: '',
    status: '',
  });
  const governanceQuery = useQueryEpiGovernance();

  const query = useMemo(() => buildEpiQuery(search), [search]);
  const {
    data,
    count,
    isLoading,
    isError,
  } = useQueryEpis(Math.max(0, page - 1), query, pageSize);

  const patchFilters = (patch: Partial<LocalFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const clearFilters = () => {
    setFilters({ situation: '', nature: '', status: '' });
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (filters.situation && situationKey(row) !== filters.situation) {
        return false;
      }
      if (filters.nature === 'national' && !row.national) return false;
      if (filters.nature === 'imported' && row.national) return false;
      if (filters.status && (row.status || StatusEnum.ACTIVE) !== filters.status) {
        return false;
      }
      return true;
    });
  }, [data, filters]);

  const sortedData = useMemo(() => {
    if (!sort) return filteredData;
    const copy = [...filteredData];
    copy.sort((a, b) => {
      const result = compareEpis(a, b, sort.field);
      return sort.order === 'asc' ? result : -result;
    });
    return copy;
  }, [filteredData, sort]);

  const visibleColumns = useMemo(() => {
    const cols: {
      id: EpiCaColumnId;
      text: string;
      column: string;
      field: SortField | null;
    }[] = [
      { id: 'ca', text: 'CA', column: '90px', field: 'ca' },
      {
        id: 'equipment',
        text: 'Equipamento',
        column: 'minmax(160px, 1.4fr)',
        field: 'equipment',
      },
      {
        id: 'description',
        text: 'Descrição',
        column: 'minmax(140px, 1fr)',
        field: null,
      },
      { id: 'situation', text: 'Situação', column: '130px', field: 'situation' },
      { id: 'expiredDate', text: 'Validade', column: '110px', field: 'expiredDate' },
      { id: 'national', text: 'Natureza', column: '100px', field: 'national' },
      { id: 'status', text: 'Status', column: '90px', field: 'status' },
    ];
    return cols.filter((c) => !hiddenColumns[c.id]);
  }, [hiddenColumns]);

  const onRegistersPerPageChange = useCallback(
    (size: number) => {
      if (!(PAGE_SIZES as readonly number[]).includes(size as any)) return;
      setPageSize(size);
      setPage(1);
    },
    [setPage],
  );

  const onSort = useCallback((field: SortField) => {
    setSort((prev) => {
      if (prev?.field !== field) return { field, order: 'asc' };
      if (prev.order === 'asc') return { field, order: 'desc' };
      return null;
    });
  }, []);

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
    if (filters.situation) {
      const labels: Record<Exclude<SituationFilter, ''>, string> = {
        valid: 'Válido',
        expired: 'Vencido',
        expired_sheet: 'Vencido (planilha)',
      };
      list.push({
        key: 'situation',
        leftLabel: 'Situação',
        label: labels[filters.situation],
        onDelete: () => patchFilters({ situation: '' }),
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
    return list;
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
            A atualização da base oficial CAEPI/MTE nesta tela será habilitada em
            uma próxima fase, após adequação do cadastro aos campos oficiais.
          </Typography>
          <Tooltip title={IMPORT_DISABLED_MESSAGE}>
            <span>
              <Button
                variant="outlined"
                size="small"
                startIcon={<SUploadIcon sx={{ fontSize: 18 }} />}
                disabled
              >
                Importar base CAEPI
              </Button>
            </span>
          </Tooltip>
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
              <Box display="flex" flexDirection="column" gap={2} width={260}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Situação</InputLabel>
                  <Select
                    label="Situação"
                    value={filters.situation}
                    onChange={(e) =>
                      patchFilters({
                        situation: e.target.value as SituationFilter,
                      })
                    }
                  >
                    <MenuItem value="">Todas</MenuItem>
                    <MenuItem value="valid">Válido</MenuItem>
                    <MenuItem value="expired">Vencido</MenuItem>
                    <MenuItem value="expired_sheet">Vencido (planilha)</MenuItem>
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
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
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
          rowsData={sortedData}
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

      <Dialog
        open={!!selected}
        onClose={() => setSelected(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Detalhe do EPI / CA</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box display="flex" flexDirection="column" gap={1.5}>
              <DetailLine label="CA" value={selected.ca} />
              <DetailLine label="Equipamento" value={selected.equipment} />
              <DetailLine label="Descrição" value={selected.description} />
              <DetailLine label="Situação" value={situationLabel(selected)} />
              <DetailLine
                label="Validade"
                value={
                  selected.expiredDate
                    ? dayjs(selected.expiredDate).format('DD/MM/YYYY')
                    : '—'
                }
              />
              <DetailLine
                label="Natureza"
                value={selected.national ? 'Nacional' : 'Importado'}
              />
              <DetailLine label="Status" value={selected.status} />
              <DetailLine label="Restrição" value={selected.restriction} />
              <DetailLine label="Observação" value={selected.observation} />
              <DetailLine label="Laudo / referência" value={selected.report} />
              <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                Fabricante/razão social não está disponível neste modelo de
                dados.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

function DetailLine({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value?.trim() ? value : '—'}</Typography>
    </Box>
  );
}
