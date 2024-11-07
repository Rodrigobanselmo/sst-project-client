import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/action-plan-browse/service/action-plan-characterization.types';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';

export interface IActionPlanHeaderRowrops {
  text: ReactNode;
  onHidden?: () => void;
  justify?: 'flex-start' | 'center' | 'flex-end';
  field?: ActionPlanOrderByEnum;
  orderByMap: Record<ActionPlanOrderByEnum, IOrderDirection>;
  setOrderBy?: (order: IOrderByParams<ActionPlanOrderByEnum>) => void;
  isFiltered?: boolean;
  onClean?: () => void;
  filters?: ReactNode;
}
