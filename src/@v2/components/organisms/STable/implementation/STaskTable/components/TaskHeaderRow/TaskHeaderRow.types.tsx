import { TaskOrderByEnum } from '@v2/services/tasks/task/browse-task/service/browse-task.service';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';

export interface ITaskHeaderRowProps {
  text: ReactNode;
  onHidden?: () => void;
  justify?: 'flex-start' | 'center' | 'flex-end';
  field?: TaskOrderByEnum;
  orderByMap: Record<TaskOrderByEnum, IOrderDirection>;
  setOrderBy?: (order: IOrderByParams<TaskOrderByEnum>) => void;
  isFiltered?: boolean;
  onClean?: () => void;
  filters?: ReactNode;
}
