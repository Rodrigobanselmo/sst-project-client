import { IOrderByParams } from '@v2/types/order-by-params.type';
import { SStatusButtonRowProps } from '../../addons/addons-rows/SStatusButtonRow/SStatusButtonRow';
import { TablesSelectEnum } from '../../hooks/useTableSelect';
import { ReactNode } from 'react';
import { CommentBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { CommentColumnsEnum } from './enums/comment-columns.enum';
import { CommentOrderByEnum } from '@v2/services/security/action-plan/action-plan/browse-action-plan/service/browse-action-plan.types';
import { CommentStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { IRiskLevelValues } from '@v2/models/security/types/risk-level-values.type';

export interface ICommentFilterProps {
  search?: string;
  status?: CommentStatusEnum[];
  isExpired?: boolean | null;
  ocupationalRisks?: IRiskLevelValues[];
  hierarchies?: {
    id: string;
    name: string;
  }[];
  responsibles?: {
    id: number;
    name: string;
  }[];
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<CommentOrderByEnum>[];
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
