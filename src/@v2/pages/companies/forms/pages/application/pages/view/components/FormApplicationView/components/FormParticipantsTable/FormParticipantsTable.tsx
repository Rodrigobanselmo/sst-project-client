import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { STableButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/STableButton';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { FormParticipantsColumnsEnum } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/enums/form-participants-columns.enum';
import { SFormParticipantsTable } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable';
import { SIconEmail } from '@v2/assets/icons/SIconEmail/SIconEmail';

import { IFormParticipantsFilterProps } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable.types';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { orderByFormParticipantsTranslation } from '@v2/models/form/translations/orden-by-form-participants.translation';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { useFetchBrowseFormParticipants } from '@v2/services/forms/form-participants/browse-form-participants/hooks/useFetchBrowseFormParticipants';
import { FormParticipantsOrderByEnum } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.types';
import { FormParticipantsTableFilter } from './components/FormParticipantsTableFilter/FormParticipantsTableFilter';
import { FormParticipantsFilterSummary } from './components/FormParticipantsFilterSummary';
import { FormParticipantsGroupedBySector } from './components/FormParticipantsGroupedBySector';
import { FormParticipantsRecorteExportButton } from './components/FormParticipantsRecorteExportButton';
import { useFormParticipantsActions } from './hooks/useFormParticipantsActions';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

const DEFAULT_PAGE_LIMIT = 15;
const PAGE_SIZE_OPTIONS = [15, 25, 50, 100] as const;
const GROUP_FETCH_CAP = 5000;

function isAllowedParticipantsPageLimit(n: number): boolean {
  return (PAGE_SIZE_OPTIONS as readonly number[]).includes(n);
}

type ParticipantsViewMode = 'list' | 'grouped';

export const FormParticipantsTable = ({
  companyId,
  applicationId,
  formApplication,
}: {
  companyId: string;
  applicationId: string;
  formApplication?: FormApplicationReadModel;
}) => {
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<FormParticipantsColumnsEnum, boolean>
  >(persistKeys.COLUMNS_FORMS_PARTICIPANTS, {} as any);

  const { onFormParticipantClick, onSendFormEmail, sendFormEmailMutation } =
    useFormParticipantsActions({
      companyId,
      applicationId,
    });

  const { queryParams, setQueryParams } =
    useQueryParamsState<IFormParticipantsFilterProps>();

  const [persistedPageLimit, setPersistedPageLimit] = usePersistedState<number>(
    persistKeys.LIMIT_FORMS_PARTICIPANTS,
    DEFAULT_PAGE_LIMIT,
  );

  const [viewMode, setViewMode] = useState<ParticipantsViewMode>('list');

  const pageLimit = useMemo(() => {
    const q = queryParams.limit;
    if (q != null && isAllowedParticipantsPageLimit(Number(q))) {
      return Number(q);
    }
    return isAllowedParticipantsPageLimit(persistedPageLimit)
      ? persistedPageLimit
      : DEFAULT_PAGE_LIMIT;
  }, [queryParams.limit, persistedPageLimit]);

  const browseFilters = useMemo(
    () => ({
      search: queryParams.search,
      status: queryParams.status,
      hierarchyIds: queryParams.hierarchies?.map((h) => h.id),
    }),
    [queryParams.search, queryParams.status, queryParams.hierarchies],
  );

  const { formParticipants, isLoading } = useFetchBrowseFormParticipants({
    companyId,
    applicationId,
    filters: browseFilters,
    orderBy: queryParams.orderBy || [
      {
        field: FormParticipantsOrderByEnum.HAS_RESPONDED,
        order: 'desc',
      },
      {
        field: FormParticipantsOrderByEnum.HIERARCHY,
        order: 'asc',
      },
      {
        field: FormParticipantsOrderByEnum.NAME,
        order: 'asc',
      },
    ],
    pagination: {
      page: queryParams.page || 1,
      limit: pageLimit,
    },
  });

  const { onOrderBy, orderChipList: orderChipsBase } = useOrderBy({
    orderByList: queryParams.orderBy,
    setOrderBy: (orderBy) => setQueryParams({ orderBy }),
    getLabel: ({ order }) => orderByTranslation[order],
    getLeftLabel: ({ field }) => orderByFormParticipantsTranslation[field],
  });

  const orderChipList = useMemo(
    () =>
      (orderChipsBase ?? []).map((c) => ({ ...c, leftLabelBold: true })),
    [orderChipsBase],
  );

  const {
    onCleanData: resetFiltersFromTableState,
    onFilterData,
    paramsChipList,
  } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      status: (value) => ({
        leftLabel: 'Status:',
        label: value,
        leftLabelBold: true,
        onDelete: () =>
          setQueryParams({
            page: 1,
            status: queryParams.status?.filter((status) => status !== value),
          }),
      }),
      hierarchies: (value) => ({
        leftLabel: value.type
          ? `${hierarchyTypeTranslation[value.type]}:`
          : 'Hierarquia:',
        label: value.name,
        leftLabelBold: true,
        onDelete: () =>
          setQueryParams({
            page: 1,
            hierarchies: queryParams.hierarchies?.filter(
              (h) => h.id !== value.id,
            ),
          }),
      }),
    },
    cleanData: {
      search: '',
      status: [],
      hierarchies: [],
      orderBy: [],
      page: 1,
      limit: DEFAULT_PAGE_LIMIT,
    },
  });

  const onCleanData = useCallback(() => {
    setPersistedPageLimit(DEFAULT_PAGE_LIMIT);
    resetFiltersFromTableState();
  }, [resetFiltersFromTableState, setPersistedPageLimit]);

  const onPageSizeChange = useCallback(
    (size: number) => {
      if (!isAllowedParticipantsPageLimit(size)) return;
      setPersistedPageLimit(size);
      onFilterData({ limit: size, page: 1 });
    },
    [onFilterData, setPersistedPageLimit],
  );

  const filterSummaryForUi = useMemo(
    () =>
      formParticipants?.filterSummary ?? {
        totalParticipants: 0,
        respondedCount: 0,
        notRespondedCount: 0,
        responseRatePercent: 0,
      },
    [formParticipants?.filterSummary],
  );

  const groupedFetchLimit = Math.min(
    GROUP_FETCH_CAP,
    Math.max(filterSummaryForUi.totalParticipants, 1),
  );

  const { formParticipants: groupedParticipants, isLoading: groupedLoading } =
    useFetchBrowseFormParticipants({
      companyId,
      applicationId,
      filters: browseFilters,
      orderBy: [
        {
          field: FormParticipantsOrderByEnum.HIERARCHY,
          order: 'asc',
        },
        {
          field: FormParticipantsOrderByEnum.NAME,
          order: 'asc',
        },
      ],
      pagination: { page: 1, limit: groupedFetchLimit },
      enabled: viewMode === 'grouped',
    });

  // Check if form is accepting responses
  const isAcceptingResponses =
    formApplication?.status === FormApplicationStatusEnum.PROGRESS;

  const hierarchyFilterDescription = useMemo(() => {
    if (!queryParams.hierarchies?.length) return '';
    return queryParams.hierarchies
      .map((h) =>
        h.type
          ? `${hierarchyTypeTranslation[h.type]} ${h.name}`
          : h.name,
      )
      .join('; ');
  }, [queryParams.hierarchies]);

  const orderByForExport = useMemo(
    () =>
      (queryParams.orderBy || []).filter((o) => o.order && o.order !== 'none'),
    [queryParams.orderBy],
  );

  const onViewModeChange = (e: SelectChangeEvent<ParticipantsViewMode>) => {
    setViewMode(e.target.value as ParticipantsViewMode);
  };

  const isPartialGroupedFetch =
    viewMode === 'grouped' &&
    filterSummaryForUi.totalParticipants > GROUP_FETCH_CAP;

  return (
    <>
      <FormParticipantsFilterSummary
        summary={filterSummaryForUi}
        isLoading={isLoading}
      />
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>
          <FormParticipantsRecorteExportButton
            companyId={companyId}
            applicationId={applicationId}
            formApplication={formApplication}
            filters={browseFilters}
            orderBy={orderByForExport}
            hierarchyLabels={hierarchyFilterDescription}
            viewMode={viewMode}
            groupedFetchLimit={groupedFetchLimit}
          />
          <STableButton
            onClick={() => onSendFormEmail()}
            text="Enviar Todos os Emails"
            icon={<SIconEmail fontSize="16px" />}
            color="info"
            loading={sendFormEmailMutation.isPending}
            disabled={!isAcceptingResponses}
            tooltip={
              isAcceptingResponses
                ? 'Enviar email para todos os participantes'
                : 'Formulário não está aceitando respostas'
            }
          />
          {/* <STableAddButton onClick={onFormParticipantAdd} /> */}
          {/* <STableColumnsButton
            showLabel
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={participantsColumns}
          /> */}
          <STableFilterButton>
            <FormParticipantsTableFilter
              onFilterData={onFilterData}
              filters={queryParams}
              companyId={companyId}
              applicationId={applicationId}
            />
          </STableFilterButton>
        </STableSearchContent>
      </STableSearch>
      <STableInfoSection>
        <STableFilterChipList onClean={onCleanData}>
          {[...orderChipList, ...paramsChipList]?.map((chip, idx) => (
            <STableFilterChip
              key={`${chip.leftLabel ?? 'chip'}-${String(chip.label)}-${idx}`}
              leftLabel={chip.leftLabel}
              leftLabelBold={chip.leftLabelBold}
              label={chip.label}
              onDelete={chip.onDelete}
            />
          ))}
        </STableFilterChipList>
      </STableInfoSection>
      <Box sx={{ mb: 2, maxWidth: 360 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="form-participants-view-mode">Modo de visualização</InputLabel>
          <Select<ParticipantsViewMode>
            labelId="form-participants-view-mode"
            label="Modo de visualização"
            value={viewMode}
            onChange={onViewModeChange}
          >
            <MenuItem value="list">Lista detalhada</MenuItem>
            <MenuItem value="grouped">Agrupado por setor</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {viewMode === 'list' ? (
        <SFormParticipantsTable
          filters={queryParams}
          setFilters={onFilterData}
          filterColumns={{}}
          setHiddenColumns={(hidden) =>
            setHiddenColumns({ ...hiddenColumns, ...hidden })
          }
          hiddenColumns={hiddenColumns}
          onSelectRow={(row) => onFormParticipantClick(row)}
          data={formParticipants?.results ?? []}
          isLoading={isLoading}
          pagination={formParticipants?.pagination}
          setPage={(page) => onFilterData({ page })}
          setOrderBy={onOrderBy}
          formApplication={formApplication}
          pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
          onPageSizeChange={onPageSizeChange}
        />
      ) : (
        <FormParticipantsGroupedBySector
          rows={groupedParticipants?.results ?? []}
          isLoading={groupedLoading}
          fetchCap={GROUP_FETCH_CAP}
          isPartialFetch={isPartialGroupedFetch}
        />
      )}
    </>
  );
};
