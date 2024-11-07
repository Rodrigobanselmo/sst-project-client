import { useRouter } from 'next/router';

import { Box } from '@mui/material';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableExportButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableButtonDivider } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButtonDivider/STableButtonDivider';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { TablesSelectEnum } from '@v2/components/organisms/STable/hooks/useTableSelect';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { ActionPlanColumnsEnum } from '@v2/components/organisms/STable/implementation/SActionPlanTable/enums/action-plan-columns.enum';
import { actionPlanColumns } from '@v2/components/organisms/STable/implementation/SActionPlanTable/maps/action-plan-column-map';
import { SActionPlanTable } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable';
import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { useApiStatus } from '@v2/hooks/useApiStatus';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ordenByTranslation } from '@v2/models/@shared/translations/orden-by.translation';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { ordenByActionPlanTranslation } from '@v2/models/security/translations/orden-by-action-plan.translation';
import { useFetchBrowseActionPlan } from '@v2/services/security/action-plan/action-plan-browse/hooks/useFetchBrowseActionPlan';
import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/action-plan-browse/service/action-plan-characterization.types';
import { useActionPlanActions } from '../../hooks/useActionPlanActions';
import { ActionPlanTableFilter } from './components/ActionPlanTableFilter/ActionPlanTableFilter';
import { ActionPlanTableFilterStage } from './components/ActionPlanTableFilter/components/ActionPlanTableFilterStage';
import { ActionPlanTableSelection } from './components/ActionPlanTableSelection/ActionPlanTableSelection';

const limit = 15;
const table = TablesSelectEnum.ACTION_PLAN;

export const ActionPlanTable = () => {
  const router = useRouter();

  const companyId = router.query.companyId as string;

  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<ActionPlanColumnsEnum, boolean>
  >(persistKeys.COLUMNS_ACTION_PLAN, {} as any);

  const { queryParams, setQueryParams } =
    useQueryParamsState<IActionPlanFilterProps>();

  const { data, isLoading } = useFetchBrowseActionPlan({
    companyId,
    filters: {
      search: queryParams.search,
      workspaceIds: [],
    },
    orderBy: queryParams.orderBy || [
      {
        field: ActionPlanOrderByEnum.LEVEL,
        order: 'desc',
      },
      {
        field: ActionPlanOrderByEnum.ORIGIN,
        order: 'asc',
      },
    ],
    pagination: {
      page: queryParams.page || 1,
      limit: queryParams.limit || limit,
    },
  });

  const { handleActionPlanEditStage, handleActionPlanExport } =
    useActionPlanActions({ companyId });

  const {
    onAddStatus,
    onEditStatus,
    onDeleteStatus,
    statusOptions,
    isLoadingStatusOptions,
  } = useApiStatus({
    companyId,
    type: StatusTypeEnum.ACTION_PLAN,
  });

  const { onOrderBy, orderChipList } = useOrderBy({
    orderByList: queryParams.orderBy,
    setOrderBy: (orderBy) => setQueryParams({ orderBy }),
    getLabel: ({ order }) => ordenByTranslation[order],
    getLeftLabel: ({ field }) => ordenByActionPlanTranslation[field],
  });

  const stages = data?.filters?.stages || [];
  const selectedStages =
    stages.filter((stage) => queryParams.stageIds?.includes(stage.id)) || [];

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      stageIds: (value) => ({
        leftLabel: 'Status',
        label: selectedStages.find((stage) => stage.id === value)?.name || '',
        onDelete: () =>
          setQueryParams({
            stageIds: queryParams.stageIds?.filter((id) => id !== value),
          }),
      }),
    },
    cleanData: {
      search: '',
      orderBy: [],
      stageIds: [],
      page: 1,
      limit,
    },
  });

  return (
    <>
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>
          <STableColumnsButton
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={actionPlanColumns}
          />
          <STableFilterButton>
            <ActionPlanTableFilter
              onFilterData={onFilterData}
              selectedStages={selectedStages}
              stages={stages}
            />
          </STableFilterButton>
          <STableButtonDivider />
          <STableExportButton onClick={handleActionPlanExport} />
        </STableSearchContent>
      </STableSearch>
      <STableInfoSection>
        <STableFilterChipList onClean={onCleanData}>
          {[...orderChipList, ...paramsChipList]?.map((chip) => (
            <STableFilterChip
              key={1}
              leftLabel={chip.leftLabel}
              label={chip.label}
              onDelete={chip.onDelete}
            />
          ))}
        </STableFilterChipList>
        <ActionPlanTableSelection table={table} stages={stages} />
      </STableInfoSection>
      <SActionPlanTable
        table={table}
        filterColumns={
          {
            // [ActionPlanColumnsEnum.STAGE]: (
            //   <Box mx={4} mt={2} mb={2} width={250}>
            //     <ActionPlanTableFilterStage
            //       selectedStages={selectedStages}
            //       stages={stages}
            //       onFilterData={onFilterData}
            //     />
            //   </Box>
            // ),
          }
        }
        filters={queryParams}
        setFilters={onFilterData}
        setHiddenColumns={(hidden) =>
          setHiddenColumns({ ...hiddenColumns, ...hidden })
        }
        hiddenColumns={hiddenColumns}
        onSelectRow={(row) => console.log(row)}
        onEditStage={(stageId, row) =>
          handleActionPlanEditStage({ ...row, stageId })
        }
        onEditPosition={(order, row) => console.log({ ...row, order })}
        data={data?.results}
        isLoading={isLoading}
        pagination={data?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
        statusButtonProps={{
          onAdd: ({ value }) => onAddStatus(value),
          onDelete: (id) => onDeleteStatus(id),
          onEdit: ({ color, value, id }) =>
            onEditStatus({ id, color, name: value }),
          options: statusOptions,
          isLoading: isLoadingStatusOptions,
        }}
      />
    </>
  );
};
