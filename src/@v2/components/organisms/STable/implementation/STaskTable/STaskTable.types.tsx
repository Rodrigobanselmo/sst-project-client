import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';
import { TablesSelectEnum } from '../../hooks/useTableSelect';
import { TaskColumnsEnum } from './enums/task-columns.enum';
import { TaskBrowseResultModel } from '@v2/models/tasks/models/task/task-browse-result.model';
import { TaskOrderByEnum } from '@v2/services/tasks/task/browse-task/service/browse-task.service';
import { SStatusButtonRowProps } from '../../addons/addons-rows/SStatusButtonRow/SStatusButtonRow';
import { SPopperStatusProps } from '@v2/components/organisms/SPopper/addons/SPopperStatus/SPopperStatus';
import { ITableData } from '../../common/STable/STable.types';

export interface ITaskFilterProps {
  search?: string;
  statusIds?: number[];
  projectIds?: number[];
  isExpired?: boolean | null;
  priorities?: number[];
  creators?: {
    id: number;
    name: string;
  }[];
  responsible?: {
    id: number;
    name: string;
  }[];
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<TaskOrderByEnum>[];
}

export interface ITaskTableProps {
  options?: {
    endRows?: ITableData<TaskBrowseResultModel>[];
    hideSelection?: boolean;
    hideHeader?: boolean;
    hideEmpty?: boolean;
  };
  companyId: string;
  data?: TaskBrowseResultModel[];
  table:
    | TablesSelectEnum.TASK
    | TablesSelectEnum.TASK_SUB
    | TablesSelectEnum.TASK_ACTION_PLAN
    | TablesSelectEnum.TASK_SUB_ACTION_PLAN;
  hiddenColumns: Record<TaskColumnsEnum, boolean>;
  filterColumns: Partial<Record<TaskColumnsEnum, ReactNode>>;
  setHiddenColumns: (
    hiddenColumns: Partial<Record<TaskColumnsEnum, boolean>>,
  ) => void;
  isLoading?: boolean;
  showPagination?: boolean;
  filters: ITaskFilterProps;
  setFilters: (values: ITaskFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<TaskOrderByEnum>) => void;
  onSelectRow: (row: TaskBrowseResultModel) => void;
  onEditStatus: (stageId: number | null, row: TaskBrowseResultModel) => void;
  statusButtonProps: Pick<
    SPopperStatusProps,
    'onDelete' | 'onEdit' | 'onAdd' | 'options' | 'isLoading'
  >;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
