import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/browse-action-plan/service/browse-action-plan.types';
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
