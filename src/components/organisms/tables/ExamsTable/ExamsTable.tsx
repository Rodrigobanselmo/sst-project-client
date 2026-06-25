import { FC, useMemo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  BoxProps,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { initialExamState } from 'components/organisms/modals/ModalAddExam/hooks/useEditExams';

import { SExamIcon } from 'assets/icons/SExamIcon';

import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';
import { ExamOriginEnum, IExam } from 'core/interfaces/api/IExam';
import {
  IQueryExam,
  useQueryExams,
} from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { StatusEnum } from 'project/enum/status.enum';

import { ExamColumnEnum, examColumnMap, examColumns } from './exam-columns';
import { EXAM_ORIGIN_FILTER_OPTIONS, EXAM_ORIGIN_LABELS } from './exam-origin.constants';
import { ExamOrderBy, ExamsDataTable } from './ExamsDataTable';

type FilterState = {
  search?: string;
  origin?: ExamOriginEnum | '';
  status?: StatusEnum | '';
};

const STATUS_FILTER_OPTIONS: { value: StatusEnum | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: StatusEnum.ACTIVE, label: 'Ativo' },
  { value: StatusEnum.INACTIVE, label: 'Inativo' },
];

const statusFilterLabel = (status: StatusEnum | '') =>
  STATUS_FILTER_OPTIONS.find((option) => option.value === status)?.label ?? status;

export const ExamsTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (company: IExam) => void;
      selectedData?: IExam[];
      query?: IQueryExam;
    }
> = () => {
  const { onStackOpenModal } = useModal();

  const [filters, setFilters] = useState<FilterState>({});
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<ExamOrderBy | null>(null);

  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<string, boolean>
  >(persistKeys.COLUMNS_EXAMS, {});

  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_EXAMS);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const patchFilters = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleOrderBy = (field: ExamColumnEnum) => {
    setOrderBy((prev) => {
      if (prev?.field !== field) return { field, order: 'asc' };
      if (prev.order === 'asc') return { field, order: 'desc' };
      return null;
    });
    setPage(1);
  };

  const query = useMemo<IQueryExam>(() => {
    const sortField = orderBy ? examColumnMap[orderBy.field].sortField : undefined;
    return {
      search: filters.search || undefined,
      origin: filters.origin || undefined,
      status: filters.status || undefined,
      orderBy: sortField,
      orderByDirection: sortField ? orderBy?.order : undefined,
    };
  }, [filters, orderBy]);

  const { data: exams, isLoading, count } = useQueryExams(page, query, pageLimit);

  const onAddExam = () => {
    onStackOpenModal(ModalEnum.EXAMS_ADD, {} as typeof initialExamState);
  };

  const onEditExam = (exam: IExam) => {
    onStackOpenModal(ModalEnum.EXAMS_ADD, {
      ...(exam as any),
    } as typeof initialExamState);
  };

  const chips = useMemo(() => {
    const list: {
      key: string;
      leftLabel: string;
      label: string;
      onDelete: () => void;
    }[] = [];

    if (filters.origin) {
      list.push({
        key: 'origin',
        leftLabel: 'Origem',
        label: EXAM_ORIGIN_LABELS[filters.origin],
        onDelete: () => patchFilters({ origin: '' }),
      });
    }
    if (filters.status) {
      list.push({
        key: 'status',
        leftLabel: 'Status',
        label: statusFilterLabel(filters.status),
        onDelete: () => patchFilters({ status: '' }),
      });
    }
    if (orderBy) {
      list.push({
        key: 'orderBy',
        leftLabel: 'Ordenar',
        label: `${examColumnMap[orderBy.field].label} (${
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

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <SExamIcon />
          <Typography variant="h6">Exames</Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAddExam}
        >
          Adicionar exame
        </Button>
      </Box>

      <STableSearch
        search={filters.search}
        onSearch={(search) => patchFilters({ search })}
      >
        <STableSearchContent>
          <STableColumnsButton
            showLabel
            columns={examColumns}
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
          />
          <STableFilterButton text="Filtros">
            <Box display="flex" flexDirection="column" gap={2} width={260}>
              <FormControl size="small" fullWidth>
                <InputLabel>Origem</InputLabel>
                <Select
                  label="Origem"
                  value={filters.origin ?? ''}
                  onChange={(e) =>
                    patchFilters({ origin: e.target.value as ExamOriginEnum | '' })
                  }
                >
                  {EXAM_ORIGIN_FILTER_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={filters.status ?? ''}
                  onChange={(e) =>
                    patchFilters({ status: e.target.value as StatusEnum | '' })
                  }
                >
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <MenuItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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

      <ExamsDataTable
        data={exams}
        isLoading={isLoading}
        hiddenColumns={hiddenColumns}
        orderBy={orderBy}
        onOrderBy={handleOrderBy}
        pagination={{ total: count, limit: pageLimit, page }}
        setPage={setPage}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
        onEditExam={onEditExam}
      />
    </Box>
  );
};
