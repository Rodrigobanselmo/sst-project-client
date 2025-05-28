import { FormApplicationOrderByEnum } from '@v2/services/forms/form-application/browse-form-application/service/browse-form-application.types';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';

export interface IFormApplicationHeaderRowProps {
  text: ReactNode;
  onHidden?: () => void;
  justify?: 'flex-start' | 'center' | 'flex-end';
  field?: FormApplicationOrderByEnum;
  orderByMap?: Record<FormApplicationOrderByEnum, IOrderDirection>;
  setOrderBy?: (order: IOrderByParams<FormApplicationOrderByEnum>) => void;
  isFiltered?: boolean;
  onClean?: () => void;
  filters?: ReactNode;
}
