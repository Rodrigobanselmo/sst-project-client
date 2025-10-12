import { CommentBrowseResultModel } from '@v2/models/security/models/comment/comment-browse-result.model';
import { CommentOrderByEnum } from '@v2/services/security/action-plan/comment/browse-comments/service/browse-action-plan.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';
import { TablesSelectEnum } from '../../hooks/useTableSelect';
import { CommentColumnsEnum } from './enums/comment-columns.enum';

export interface ICommentFilterProps {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<CommentOrderByEnum>[];
  creators?: { id: number; name: string }[];
  generateSources?: {
    id: string;
    name: string;
  }[];
}

export interface ICommentTableTableProps {
  companyId: string;
  data?: CommentBrowseResultModel[];
  table: TablesSelectEnum;
  hiddenColumns: Record<CommentColumnsEnum, boolean>;
  filterColumns: Partial<Record<CommentColumnsEnum, ReactNode>>;
  setHiddenColumns: (
    hiddenColumns: Partial<Record<CommentColumnsEnum, boolean>>,
  ) => void;
  isLoading?: boolean;
  filters: ICommentFilterProps;
  setFilters: (values: ICommentFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<CommentOrderByEnum>) => void;
  onSelectRow: (row: CommentBrowseResultModel) => void;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
