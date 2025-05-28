import { AbsenteeismHierarchyTotalOrderByEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';

export interface IAbsenteeismHeaderRowProps {
  text: ReactNode;
  onHidden?: () => void;
  justify?: 'flex-start' | 'center' | 'flex-end';
  field?: AbsenteeismHierarchyTotalOrderByEnum;
  orderByMap: Record<AbsenteeismHierarchyTotalOrderByEnum, IOrderDirection>;
  setOrderBy?: (
    order: IOrderByParams<AbsenteeismHierarchyTotalOrderByEnum>,
  ) => void;
  isFiltered?: boolean;
  onClean?: () => void;
  filters?: ReactNode;
}
