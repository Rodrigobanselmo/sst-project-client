import { DocumentControlOrderByEnum } from '@v2/services/enterprise/document-control/document-control/browse-document-control/service/browse-document-control.types';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';

export interface IDocumentControlHeaderRowrops {
  text: ReactNode;
  onHidden?: () => void;
  justify?: 'flex-start' | 'center' | 'flex-end';
  field?: DocumentControlOrderByEnum;
  orderByMap?: Record<DocumentControlOrderByEnum, IOrderDirection>;
  setOrderBy?: (order: IOrderByParams<DocumentControlOrderByEnum>) => void;
  isFiltered?: boolean;
  onClean?: () => void;
  filters?: ReactNode;
}
