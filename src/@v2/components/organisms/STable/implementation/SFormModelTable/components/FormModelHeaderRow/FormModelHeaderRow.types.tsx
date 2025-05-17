import { FormModelOrderByEnum } from '@v2/services/forms/form/browse-form-model/service/browse-form-model.types';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';

export interface IFormModelHeaderRowProps {
  text: ReactNode;
  onHidden?: () => void;
  justify?: 'flex-start' | 'center' | 'flex-end';
  field?: FormModelOrderByEnum;
  orderByMap?: Record<FormModelOrderByEnum, IOrderDirection>;
  setOrderBy?: (order: IOrderByParams<FormModelOrderByEnum>) => void;
  isFiltered?: boolean;
  onClean?: () => void;
  filters?: ReactNode;
}
