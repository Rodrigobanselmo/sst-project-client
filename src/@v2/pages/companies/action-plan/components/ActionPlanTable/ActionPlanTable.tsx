import { useRouter } from 'next/router';

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
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ordenByTranslation } from '@v2/models/@shared/translations/orden-by.translation';
import { ordenByActionPlanTranslation } from '@v2/models/security/translations/orden-by-action-plan.translation';
import { useFetchBrowseActionPlan } from '@v2/services/security/action-plan/action-plan/browse-action-plan/hooks/useFetchBrowseActionPlan';
import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/action-plan/browse-action-plan/service/browse-action-plan.types';
import { ActionPlanTableFilter } from './components/ActionPlanTableFilter/ActionPlanTableFilter';
import { ActionPlanTableSelection } from './components/ActionPlanTableSelection/ActionPlanTableSelection';
import { ActionPlanStatusTypeTranslate } from '@v2/models/security/translations/action-plan-status-type.translaton';
import { OcupationalRiskLevelTranslation } from '@v2/models/security/translations/ocupational-risk-level.translation';

const limit = 15;
const table = TablesSelectEnum.ACTION_PLAN;

export const ActionPlanTable = ({
  workspaceId,
  companyId,
  userId,
  disabledResponisble,
}: {
  workspaceId?: string;
  companyId: string;
  userId?: number;
  disabledResponisble?: boolean;
}) => {
  const router = useRouter();

  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<ActionPlanColumnsEnum, boolean>
  >(persistKeys.COLUMNS_ACTION_PLAN, {} as any);

  const { queryParams, setQueryParams } =
    useQueryParamsState<IActionPlanFilterProps>();

  const { data, isLoading } = useFetchBrowseActionPlan({
    companyId,
    filters: {
      search: queryParams.search,
      ocupationalRisks: queryParams.ocupationalRisks,
      status: queryParams.status,
      isExpired: queryParams.isExpired || undefined,
      responisbleIds: userId
        ? [userId]
        : queryParams.responsibles?.map((resp) => resp.id),
      workspaceIds: workspaceId ? [workspaceId] : undefined,
      hierarchyIds: queryParams.hierarchies?.map((hierarchy) => hierarchy.id),
    },
    orderBy: queryParams.orderBy || [
      {
        field: ActionPlanOrderByEnum.STATUS,
        order: 'asc',
      },
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

  const { onOrderBy, orderChipList } = useOrderBy({
    orderByList: queryParams.orderBy,
    setOrderBy: (orderBy) => setQueryParams({ orderBy }),
    getLabel: ({ order }) => ordenByTranslation[order],
    getLeftLabel: ({ field }) => ordenByActionPlanTranslation[field],
  });

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      isExpired: (value) => ({
        leftLabel: 'Responsável',
        label: value ? 'Expirado' : 'Não Expirado',
        onDelete: () =>
          setQueryParams({
            page: 1,
            isExpired: value,
          }),
      }),
      responsibles: (value) => ({
        leftLabel: 'Responsável',
        label: value.name,
        onDelete: () =>
          setQueryParams({
            page: 1,
            responsibles: queryParams.responsibles?.filter(
              (responsible) => responsible.id !== value.id,
            ),
          }),
      }),
      hierarchies: (value) => ({
        leftLabel: 'Hierarquia',
        label: value.name,
        onDelete: () =>
          setQueryParams({
            page: 1,
            hierarchies: queryParams.hierarchies?.filter(
              (h) => h.id !== value.id,
            ),
          }),
      }),
      status: (value) => ({
        leftLabel: 'Status',
        label: ActionPlanStatusTypeTranslate[value],
        onDelete: () =>
          setQueryParams({
            page: 1,
            status: queryParams.status?.filter((id) => id !== value),
          }),
      }),
      ocupationalRisks: (value) => ({
        leftLabel: 'Nível',
        label: OcupationalRiskLevelTranslation[value],
        onDelete: () =>
          setQueryParams({
            page: 1,
            ocupationalRisks: queryParams.ocupationalRisks?.filter(
              (id) => id !== value,
            ),
          }),
      }),
    },
    cleanData: {
      search: '',
      isExpired: null,
      orderBy: [],
      status: [],
      ocupationalRisks: [],
      responsibles: [],
      hierarchies: [],
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
          {null}
          <STableColumnsButton
            showLabel
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={actionPlanColumns}
          />
          <STableFilterButton>
            <ActionPlanTableFilter
              onFilterData={onFilterData}
              filters={queryParams}
              companyId={companyId}
              workspaceId={workspaceId}
            />
          </STableFilterButton>
          <STableButtonDivider />
          <STableExportButton
            disabled
            onClick={async () => {
              //
            }}
          />
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
        <ActionPlanTableSelection table={table} companyId={companyId} />
      </STableInfoSection>
      <SActionPlanTable
        companyId={companyId}
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
        disabledResponisble={disabledResponisble}
        hiddenColumns={hiddenColumns}
        onSelectRow={(row) => null}
        data={data?.results}
        isLoading={isLoading}
        pagination={data?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
      />
    </>
  );
};
