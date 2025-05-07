import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { TablesSelectEnum } from '@v2/components/organisms/STable/hooks/useTableSelect';
import { TaskColumnsEnum } from '@v2/components/organisms/STable/implementation/STaskTable/enums/task-columns.enum';
import { STaskTable } from '@v2/components/organisms/STable/implementation/STaskTable/STaskTable';
import { ITaskFilterProps } from '@v2/components/organisms/STable/implementation/STaskTable/STaskTable.types';
import { useApiStatus } from '@v2/hooks/useApiStatus';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { useFetchBrowseTask } from '@v2/services/tasks/task/browse-task/hooks/useFetchBrowseTask';
import { TaskOrderByEnum } from '@v2/services/tasks/task/browse-task/service/browse-task.service';
import { useState } from 'react';
import { useTaskTableActions } from '../../hooks/useTaskTableActions';
import { TaskTableSelection } from './components/TaskTableSelection/TaskTableSelection';
import { useTasksTable } from './hooks/useTasksTable';

interface Props {
  companyId: string;
  actionPlanId?: string;
}

const limit = 15;
const table = TablesSelectEnum.TASK_ACTION_PLAN;

export const TasksActionPlanTable = ({ actionPlanId, companyId }: Props) => {
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<TaskColumnsEnum, boolean>
  >(persistKeys.COLUMNS_TASK_ACTION_PLAN, {} as any);

  const [queryParams, setParams] = useState<ITaskFilterProps>({});

  const setQueryParams = (params: Partial<ITaskFilterProps>) => {
    setParams((prev) => ({ ...prev, ...params }));
  };

  const { tasks, isLoading } = useFetchBrowseTask({
    companyId,
    filters: {
      search: queryParams.search,
      statusIds: queryParams.statusIds,
      responsibleIds: queryParams.responsible?.map((resp) => resp.id),
      actionPlanIds: [actionPlanId || 'no-id'],
    },
    orderBy: queryParams.orderBy || [
      {
        field: TaskOrderByEnum.STATUS,
        order: 'asc',
      },
      {
        field: TaskOrderByEnum.PRIORITY,
        order: 'desc',
      },
      {
        field: TaskOrderByEnum.DESCRIPTION,
        order: 'asc',
      },
    ],
    pagination: {
      page: queryParams.page || 1,
      limit: queryParams.limit || limit,
    },
  });

  const {
    onAddStatus,
    onEditStatus,
    onDeleteStatus,
    statusOptions,
    isLoadingStatusOptions,
  } = useApiStatus({
    companyId,
    type: StatusTypeEnum.TASK_ACTION_PLAN,
  });

  const {
    onCleanData,
    onFilterData,
    onOrderBy,
    orderChipList,
    paramsChipList,
    status,
  } = useTasksTable({
    tasks,
    queryParams,
    setQueryParams,
    limit,
  });

  const { onSelectRow, handleTaskEdit, handleTaskEditMany } =
    useTaskTableActions({ companyId });

  return (
    <>
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
        <TaskTableSelection
          onEditMany={handleTaskEditMany}
          status={status}
          table={table}
          companyId={companyId}
        />
      </STableInfoSection>
      <STaskTable
        showPagination={false}
        companyId={companyId}
        table={table}
        filterColumns={{}}
        filters={queryParams}
        setFilters={onFilterData}
        setHiddenColumns={(hidden) =>
          setHiddenColumns({ ...hiddenColumns, ...hidden })
        }
        hiddenColumns={hiddenColumns}
        onSelectRow={(row) => onSelectRow(row)}
        data={tasks?.results}
        isLoading={isLoading}
        pagination={tasks?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
        onEditStatus={(statusId, row) =>
          handleTaskEdit({ id: row.id, statusId })
        }
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
