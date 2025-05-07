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
import { useTasksTable } from './hooks/useTasksTable';
import { useFetchBrowseTaskActionPlan } from '@v2/services/tasks/task/browse-task/hooks/useFetchBrowseTaskActionPlan';

interface Props {
  companyId: string;
  actionPlanId: string;
}

const limit = 30;
const table = TablesSelectEnum.TASK_SUB_ACTION_PLAN;

export const TasksSubActionPlanTable = ({ actionPlanId, companyId }: Props) => {
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<TaskColumnsEnum, boolean>
  >(persistKeys.COLUMNS_TASK_SUB_ACTION_PLAN, {} as any);

  const [queryParams, setParams] = useState<ITaskFilterProps>({});

  const setQueryParams = (params: Partial<ITaskFilterProps>) => {
    setParams((prev) => ({ ...prev, ...params }));
  };

  const { tasks, isLoading } = useFetchBrowseTaskActionPlan({
    companyId,
    actionPlanId,
    filters: {
      search: queryParams.search,
      statusIds: queryParams.statusIds,
      responsibleIds: queryParams.responsible?.map((resp) => resp.id),
      actionPlanIds: [actionPlanId],
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

  const { onFilterData, onOrderBy } = useTasksTable({
    tasks,
    queryParams,
    setQueryParams,
    limit,
  });

  const { onSelectRow, handleTaskEdit } = useTaskTableActions({ companyId });

  return (
    <>
      <STaskTable
        options={{
          hideEmpty: true,
          hideHeader: true,
          hideSelection: true,
          endRows: [
            {
              column: '100px',
              header: null,
              row: (row) => null,
            },
          ],
        }}
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
