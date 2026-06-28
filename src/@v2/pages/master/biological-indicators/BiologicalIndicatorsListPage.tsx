import { FC, useMemo, useState } from 'react';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import { SInput } from '@v2/components/forms/fields/SInput/SInput';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useFetchBrowseBiologicalIndicators } from '@v2/services/medicine/biological-indicator/hooks/useFetchBrowseBiologicalIndicators';
import {
  BIOLOGICAL_INDICATOR_STATUS_LABELS,
  BIOLOGICAL_INDICATOR_TABLE_LABELS,
  BIOLOGICAL_INDICATOR_TYPE_LABELS,
} from '@v2/pages/master/biological-indicators/biological-indicator-labels.util';
import type {
  BiologicalIndicatorStatus,
  BiologicalIndicatorTable,
  BiologicalIndicatorType,
  BrowseBiologicalIndicatorsParams,
} from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  BiologicalIndicatorColumnEnum,
  biologicalIndicatorColumnMap,
  biologicalIndicatorColumns,
  sortBiologicalIndicators,
} from './components/biological-indicator-columns';
import {
  BiologicalIndicatorOrderBy,
  BiologicalIndicatorTable as BiologicalIndicatorDataTable,
} from './components/BiologicalIndicatorTable';
import { NormativeUpdateMenu } from './components/NormativeUpdateMenu';

const FETCH_ALL_LIMIT = 100;

const triStateOptions = [
  { value: '', label: 'Todos' },
  { value: 'true', label: 'Sim' },
  { value: 'false', label: 'Não' },
];

type FilterState = {
  search?: string;
  substanceName?: string;
  cas?: string;
  tableNumber?: BiologicalIndicatorTable | '';
  indicatorType?: BiologicalIndicatorType | '';
  status?: BiologicalIndicatorStatus | '';
  requiresNormativeReview?: string;
  isSubstanceGroup?: string;
  hasConfirmedRisk?: string;
  hasConfirmedExam?: string;
  hasPendency?: string;
};

const triStateLabel = (value?: string) => (value === 'true' ? 'Sim' : 'Não');

export const BiologicalIndicatorsListPage: FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({});
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<BiologicalIndicatorOrderBy | null>(null);

  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<string, boolean>
  >(persistKeys.COLUMNS_BIOLOGICAL_INDICATOR, {});

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_BIOLOGICAL_INDICATOR);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const patchFilters = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleOrderBy = (field: BiologicalIndicatorColumnEnum) => {
    setOrderBy((prev) => {
      if (prev?.field !== field) return { field, order: 'asc' };
      if (prev.order === 'asc') return { field, order: 'desc' };
      return null;
    });
    setPage(1);
  };

  const browseParams = useMemo<BrowseBiologicalIndicatorsParams>(
    () => ({
      page: 1,
      limit: FETCH_ALL_LIMIT,
      search: filters.search || undefined,
      substanceName: filters.substanceName || undefined,
      cas: filters.cas || undefined,
      tableNumber: filters.tableNumber || undefined,
      indicatorType: filters.indicatorType || undefined,
      status: filters.status || undefined,
      requiresNormativeReview:
        filters.requiresNormativeReview === '' ||
        filters.requiresNormativeReview == null
          ? undefined
          : filters.requiresNormativeReview === 'true',
      isSubstanceGroup:
        filters.isSubstanceGroup === '' || filters.isSubstanceGroup == null
          ? undefined
          : filters.isSubstanceGroup === 'true',
      hasConfirmedRisk:
        filters.hasConfirmedRisk === '' || filters.hasConfirmedRisk == null
          ? undefined
          : filters.hasConfirmedRisk === 'true',
      hasConfirmedExam:
        filters.hasConfirmedExam === '' || filters.hasConfirmedExam == null
          ? undefined
          : filters.hasConfirmedExam === 'true',
      hasPendency:
        filters.hasPendency === '' || filters.hasPendency == null
          ? undefined
          : filters.hasPendency === 'true',
    }),
    [filters],
  );

  const { data, isLoading } = useFetchBrowseBiologicalIndicators(browseParams);

  const allRows = useMemo(() => data?.data ?? [], [data]);

  const sortedRows = useMemo(
    () => sortBiologicalIndicators(allRows, orderBy),
    [allRows, orderBy],
  );

  const total = sortedRows.length;

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageLimit;
    return sortedRows.slice(start, start + pageLimit);
  }, [sortedRows, page, pageLimit]);

  const chips = useMemo(() => {
    const list: { key: string; leftLabel: string; label: string; onDelete: () => void }[] =
      [];

    if (filters.substanceName) {
      list.push({
        key: 'substanceName',
        leftLabel: 'Substância',
        label: filters.substanceName,
        onDelete: () => patchFilters({ substanceName: '' }),
      });
    }
    if (filters.cas) {
      list.push({
        key: 'cas',
        leftLabel: 'CAS',
        label: filters.cas,
        onDelete: () => patchFilters({ cas: '' }),
      });
    }
    if (filters.tableNumber) {
      list.push({
        key: 'tableNumber',
        leftLabel: 'Quadro',
        label: BIOLOGICAL_INDICATOR_TABLE_LABELS[filters.tableNumber],
        onDelete: () => patchFilters({ tableNumber: '' }),
      });
    }
    if (filters.indicatorType) {
      list.push({
        key: 'indicatorType',
        leftLabel: 'Tipo',
        label: BIOLOGICAL_INDICATOR_TYPE_LABELS[filters.indicatorType],
        onDelete: () => patchFilters({ indicatorType: '' }),
      });
    }
    if (filters.status) {
      list.push({
        key: 'status',
        leftLabel: 'Status',
        label: BIOLOGICAL_INDICATOR_STATUS_LABELS[filters.status],
        onDelete: () => patchFilters({ status: '' }),
      });
    }
    const triStates: [keyof FilterState, string][] = [
      ['requiresNormativeReview', 'Revisão normativa'],
      ['isSubstanceGroup', 'Grupo normativo'],
      ['hasConfirmedRisk', 'Risco confirmado'],
      ['hasConfirmedExam', 'Exame confirmado'],
      ['hasPendency', 'Com pendência'],
    ];
    triStates.forEach(([field, label]) => {
      const value = filters[field];
      if (value === 'true' || value === 'false') {
        list.push({
          key: field,
          leftLabel: label,
          label: triStateLabel(value),
          onDelete: () => patchFilters({ [field]: '' } as Partial<FilterState>),
        });
      }
    });

    if (orderBy) {
      list.push({
        key: 'orderBy',
        leftLabel: 'Ordenar',
        label: `${biologicalIndicatorColumnMap[orderBy.field].label} (${
          orderBy.order === 'asc' ? 'crescente' : 'decrescente'
        })`,
        onDelete: () => setOrderBy(null),
      });
    }

    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, orderBy]);

  const handleClean = () => {
    setFilters({});
    setOrderBy(null);
    setPage(1);
  };

  // Preset rápido de curadoria: rascunhos (DRAFT) que ainda têm pendências.
  const draftWithPendencyActive =
    filters.status === 'DRAFT' && filters.hasPendency === 'true';

  const toggleDraftWithPendency = () => {
    if (draftWithPendencyActive) {
      patchFilters({ status: '', hasPendency: '' });
    } else {
      patchFilters({ status: 'DRAFT', hasPendency: 'true' });
    }
  };

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
        >
          <Box>
            <Typography variant="h5">NR-7 — Indicadores biológicos</Typography>
            <Typography variant="body2" color="text.secondary">
              Base normativa brasileira de indicadores biológicos. Serve como
              fonte primária para sincronização e curadoria técnica das regras de
              exame. As regras geradas a partir desta base aparecem na Biblioteca
              Risco × Exame (via “Sincronizar NR-07”, naquela tela).
            </Typography>
            <Button
              variant="text"
              size="small"
              endIcon={<ArrowForwardIcon />}
              onClick={() => router.push(RoutesEnum.DATABASE_EXAM_RISK_RULES)}
              sx={{ px: 0, mt: 0.5 }}
            >
              Abrir Biblioteca Risco × Exame
            </Button>
          </Box>
          <NormativeUpdateMenu />
        </Box>

        <Paper sx={{ p: 2 }}>
          <STableSearch
            search={filters.search}
            onSearch={(search) => patchFilters({ search })}
          >
            <STableSearchContent>
              <Button
                size="small"
                variant={draftWithPendencyActive ? 'contained' : 'outlined'}
                color={draftWithPendencyActive ? 'warning' : 'inherit'}
                onClick={toggleDraftWithPendency}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Rascunhos com pendência
              </Button>
              <STableColumnsButton
                showLabel
                columns={biologicalIndicatorColumns}
                hiddenColumns={hiddenColumns}
                setHiddenColumns={setHiddenColumns}
              />
              <STableFilterButton text="Filtros">
                <Box display="flex" flexDirection="column" gap={2} width={280}>
                  <SInput
                    label="Substância"
                    value={filters.substanceName ?? ''}
                    onChange={(e) => patchFilters({ substanceName: e.target.value })}
                  />
                  <SInput
                    label="CAS"
                    value={filters.cas ?? ''}
                    onChange={(e) => patchFilters({ cas: e.target.value })}
                  />
                  <FormControl size="small" fullWidth>
                    <InputLabel>Quadro</InputLabel>
                    <Select
                      label="Quadro"
                      value={filters.tableNumber ?? ''}
                      onChange={(e) =>
                        patchFilters({
                          tableNumber: e.target.value as BiologicalIndicatorTable | '',
                        })
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="QUADRO_1">Quadro 1</MenuItem>
                      <MenuItem value="QUADRO_2">Quadro 2</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      label="Tipo"
                      value={filters.indicatorType ?? ''}
                      onChange={(e) =>
                        patchFilters({
                          indicatorType: e.target.value as BiologicalIndicatorType | '',
                        })
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      <MenuItem value="IBE_EE">IBE EE</MenuItem>
                      <MenuItem value="IBE_SC">IBE SC</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      value={filters.status ?? ''}
                      onChange={(e) =>
                        patchFilters({
                          status: e.target.value as BiologicalIndicatorStatus | '',
                        })
                      }
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {Object.entries(BIOLOGICAL_INDICATOR_STATUS_LABELS).map(
                        ([value, label]) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ),
                      )}
                    </Select>
                  </FormControl>
                  {(
                    [
                      ['requiresNormativeReview', 'Revisão normativa'],
                      ['isSubstanceGroup', 'Grupo normativo'],
                      ['hasConfirmedRisk', 'Risco confirmado'],
                      ['hasConfirmedExam', 'Exame confirmado'],
                      ['hasPendency', 'Com pendência'],
                    ] as [keyof FilterState, string][]
                  ).map(([field, label]) => (
                    <FormControl key={field} size="small" fullWidth>
                      <InputLabel>{label}</InputLabel>
                      <Select
                        label={label}
                        value={(filters[field] as string) ?? ''}
                        onChange={(e) =>
                          patchFilters({ [field]: e.target.value } as Partial<FilterState>)
                        }
                      >
                        {triStateOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ))}
                </Box>
              </STableFilterButton>
            </STableSearchContent>
          </STableSearch>

          {chips.length > 0 && (
            <STableInfoSection>
              <STableFilterChipList onClean={handleClean}>
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

          <BiologicalIndicatorDataTable
            data={pageRows}
            isLoading={isLoading}
            hiddenColumns={hiddenColumns}
            orderBy={orderBy}
            onOrderBy={handleOrderBy}
            pagination={{ total, limit: pageLimit, page }}
            setPage={setPage}
            pageSizeOptions={pageSizeOptions}
            onPageSizeChange={onPageSizeChange}
            onSelectRow={(row) =>
              router.push(`${RoutesEnum.DATABASE_BIOLOGICAL_INDICATORS}/${row.id}`)
            }
          />
        </Paper>
      </Box>
    </SAuthShow>
  );
};
