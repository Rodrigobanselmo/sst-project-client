import { CommentOrderByEnum } from '@v2/services/security/action-plan/comment/browse-comments/service/browse-action-plan.types';
import {
  IOrderByParams,
  IOrderDirection,
} from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';

export interface ICommentHeaderRowrops {
  text: ReactNode;
  onHidden?: () => void;
  justify?: 'flex-start' | 'center' | 'flex-end';
  field?: CommentOrderByEnum;
  orderByMap: Record<CommentOrderByEnum, IOrderDirection>;
  setOrderBy?: (order: IOrderByParams<CommentOrderByEnum>) => void;
  isFiltered?: boolean;
  onClean?: () => void;
  filters?: ReactNode;
}
