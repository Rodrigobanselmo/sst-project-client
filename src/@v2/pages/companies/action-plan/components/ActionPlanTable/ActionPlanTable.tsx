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
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { ordenByActionPlanTranslation } from '@v2/models/security/translations/orden-by-action-plan.translation';
import { useFetchBrowseActionPlan } from '@v2/services/security/action-plan/action-plan/browse-action-plan/hooks/useFetchBrowseActionPlan';
import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/action-plan/browse-action-plan/service/browse-action-plan.types';
import { ActionPlanTableFilter } from './components/ActionPlanTableFilter/ActionPlanTableFilter';
import { ActionPlanTableSelection } from './components/ActionPlanTableSelection/ActionPlanTableSelection';
import { ActionPlanStatusTypeTranslate } from '@v2/models/security/translations/action-plan-status-type.translaton';
import { OccupationalRiskLevelTranslation } from '@v2/models/security/translations/ocupational-risk-level.translation';
import { useActionPlanTableActions } from './hooks/useActionPlanActions';

const limit = 15;
const table = TablesSelectEnum.ACTION_PLAN;

export const ActionPlanTable = ({
  workspaceId,
  companyId,
  userId,
  disabledResponsible,
}: {
  workspaceId: string;
  companyId: string;
  userId?: number;
  disabledResponsible?: boolean;
}) => {
  const router = useRouter();

  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<ActionPlanColumnsEnum, boolean>
  >(persistKeys.COLUMNS_ACTION_PLAN, {} as any);

  const { queryParams, setQueryParams } =
    useQueryParamsState<IActionPlanFilterProps>();

  const { data, isLoading } = useFetchBrowseActionPlan({
    companyId,
    workspaceId,
    filters: {
      search: queryParams.search,
      occupationalRisks: queryParams.occupationalRisks,
      status: queryParams.status,
      isExpired: queryParams.isExpired || undefined,
      riskTypes: queryParams.riskTypes,
      riskSubTypes: queryParams.riskSubTypes?.map((subType) => subType.id),
      responsibleIds: userId
        ? [userId]
        : queryParams.responsibles?.map((resp) => Number(resp.id)),
      workspaceIds: undefined,
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
    getLabel: ({ order }) => orderByTranslation[order],
    getLeftLabel: ({ field }) => ordenByActionPlanTranslation[field],
  });

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      isExpired: (value) => ({
        label: value ? 'Expirado' : 'Não Expirado',
        onDelete: () =>
          setQueryParams({
            page: 1,
            isExpired: null,
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
      occupationalRisks: (value) => ({
        leftLabel: 'Nível',
        label: OccupationalRiskLevelTranslation[value],
        onDelete: () =>
          setQueryParams({
            page: 1,
            occupationalRisks: queryParams.occupationalRisks?.filter(
              (id) => id !== value,
            ),
          }),
      }),
      riskSubTypes: (value) => ({
        leftLabel: 'Subtipo de Risco',
        label: value.name,
        onDelete: () =>
          setQueryParams({
            page: 1,
            riskSubTypes: queryParams.riskSubTypes?.filter(
              (subType) => subType.id !== value.id,
            ),
          }),
      }),
      riskTypes: (value) => ({
        leftLabel: 'Tipo de Risco',
        label: value,
        onDelete: () =>
          setQueryParams({
            page: 1,
            riskTypes: queryParams.riskTypes?.filter((type) => type !== value),
          }),
      }),
    },
    cleanData: {
      search: '',
      isExpired: null,
      orderBy: [],
      status: [],
      occupationalRisks: [],
      responsibles: [],
      hierarchies: [],
      riskSubTypes: [],
      riskTypes: [],
      page: 1,
      limit,
    },
  });

  const { onSelectRow } = useActionPlanTableActions({ companyId });

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
              modelFilters={data?.filters}
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
        disabledResponisble={disabledResponsible}
        hiddenColumns={hiddenColumns}
        onSelectRow={(row) => onSelectRow(row)}
        data={data?.results}
        isLoading={isLoading}
        pagination={data?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
      />
    </>
  );
};
