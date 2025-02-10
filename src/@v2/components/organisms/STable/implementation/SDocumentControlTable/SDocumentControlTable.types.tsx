import { DocumentControlBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-browse-result.model';
import { DocumentControlOrderByEnum } from '@v2/services/enterprise/document-control/document-control/browse-document-control/service/browse-document-control.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';
import { DocumentControlColumnsEnum } from './enums/document-control-columns.enum';

export interface IDocumentControlFilterProps {
  search?: string;
  types?: string[];
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<DocumentControlOrderByEnum>[];
}

export interface IDocumentControlTableTableProps {
  data?: DocumentControlBrowseResultModel[];
  hiddenColumns: Record<DocumentControlColumnsEnum, boolean>;
  filterColumns: Partial<Record<DocumentControlColumnsEnum, ReactNode>>;
  setHiddenColumns: (
    hiddenColumns: Partial<Record<DocumentControlColumnsEnum, boolean>>,
  ) => void;
  isLoading?: boolean;
  filters: IDocumentControlFilterProps;
  setFilters: (values: IDocumentControlFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<DocumentControlOrderByEnum>) => void;
  onSelectRow: (row: DocumentControlBrowseResultModel) => void;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
