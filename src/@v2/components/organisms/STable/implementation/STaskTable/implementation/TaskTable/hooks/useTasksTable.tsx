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
import { taskColumns } from '@v2/components/organisms/STable/implementation/STaskTable/maps/task-column-map';
import { STaskTable } from '@v2/components/organisms/STable/implementation/STaskTable/STaskTable';
import { ITaskFilterProps } from '@v2/components/organisms/STable/implementation/STaskTable/STaskTable.types';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { orderByTaskTranslation } from '@v2/models/security/translations/orden-by-task.translation';
import { TaskBrowseModel } from '@v2/models/tasks/models/task/task-browse.model';
import { TaskPriorityTranslation } from '@v2/models/tasks/translations/priority.translation';

interface Props {
  tasks: TaskBrowseModel | undefined;
  queryParams: ITaskFilterProps;
  setQueryParams: (params: Partial<ITaskFilterProps>) => void;
  limit?: number;
}

export const useTasksTable = ({
  tasks,
  queryParams,
  setQueryParams,
  limit = 15,
}: Props) => {
  const { onOrderBy, orderChipList } = useOrderBy({
    orderByList: queryParams.orderBy,
    setOrderBy: (orderBy) => setQueryParams({ orderBy }),
    getLabel: ({ order }) => orderByTranslation[order],
    getLeftLabel: ({ field }) => orderByTaskTranslation[field],
  });

  const status = tasks?.filters?.status || [];
  const selectedStatus =
    status.filter((status) => queryParams.statusIds?.includes(status.id)) || [];

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
      priorities: (value) => ({
        leftLabel: 'Prioridade',
        label: TaskPriorityTranslation[value],
        onDelete: () =>
          setQueryParams({
            page: 1,
            priorities: queryParams.priorities?.filter((id) => id !== value),
          }),
      }),
      projectIds: null,
      creators: null,
      responsible: (value) => ({
        leftLabel: 'Responsável',
        label: value.name,
        onDelete: () =>
          setQueryParams({
            page: 1,
            responsible: queryParams.responsible?.filter(
              (responsible) => responsible.id !== value.id,
            ),
          }),
      }),
      statusIds: (value) => ({
        leftLabel: 'Status',
        label: selectedStatus.find((stage) => stage.id === value)?.name || '',
        onDelete: () =>
          setQueryParams({
            page: 1,
            statusIds: queryParams.statusIds?.filter((id) => id !== value),
          }),
      }),
    },
    cleanData: {
      search: '',
      isExpired: null,
      orderBy: [],
      statusIds: [],
      creators: [],
      projectIds: [],
      priorities: [],
      responsible: [],
      page: 1,
      limit,
    },
  });

  return {
    onCleanData,
    onFilterData,
    paramsChipList,
    onOrderBy,
    orderChipList,
    status,
    selectedStatus,
  };
};
