import { AbsenteeismEmployeeTotalOrderByEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-employee/service/browse-absenteeism-employee.service';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';

export interface IAbsenteeismHeaderRowProps {
  text: ReactNode;
  onHidden?: () => void;
  justify?: 'flex-start' | 'center' | 'flex-end';
  field?: AbsenteeismEmployeeTotalOrderByEnum;
  orderByMap: Record<AbsenteeismEmployeeTotalOrderByEnum, IOrderDirection>;
  setOrderBy?: (
    order: IOrderByParams<AbsenteeismEmployeeTotalOrderByEnum>,
  ) => void;
  isFiltered?: boolean;
  onClean?: () => void;
  filters?: ReactNode;
}
