import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';
import { TablesSelectEnum } from '../../hooks/useTableSelect';
import { DocumentControlColumnsEnum } from './enums/document-control-columns.enum';
import { DocumentControlOrderByEnum } from '@v2/services/enterprise/document-control/document-control/browse-document-control/service/browse-document-control.types';
import { DocumentControlBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-browse-result.model';

export interface IDocumentControlFilterProps {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<DocumentControlOrderByEnum>[];
  creators?: { id: number; name: string }[];
}

export interface IDocumentControlTableTableProps {
  companyId: string;
  data?: DocumentControlBrowseResultModel[];
  table: TablesSelectEnum;
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
