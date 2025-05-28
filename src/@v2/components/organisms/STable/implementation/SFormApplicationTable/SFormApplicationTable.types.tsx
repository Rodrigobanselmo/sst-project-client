import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';
import { FormApplicationColumnsEnum } from './enums/form-application-columns.enum';
import { FormApplicationBrowseResultModel } from '@v2/models/form/models/form-application/form-application-browse-result.model';
import { FormApplicationOrderByEnum } from '@v2/services/forms/form-application/browse-form-application/service/browse-form-application.types';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';

export interface IFormApplicationFilterProps {
  search?: string;
  status?: FormApplicationStatusEnum[];
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<FormApplicationOrderByEnum>[];
}

export interface IFormApplicationTableTableProps {
  data?: FormApplicationBrowseResultModel[];
  hiddenColumns: Record<FormApplicationColumnsEnum, boolean>;
  filterColumns: Partial<Record<FormApplicationColumnsEnum, ReactNode>>;
  setHiddenColumns: (
    hiddenColumns: Partial<Record<FormApplicationColumnsEnum, boolean>>,
  ) => void;
  isLoading?: boolean;
  filters: IFormApplicationFilterProps;
  setFilters: (values: IFormApplicationFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<FormApplicationOrderByEnum>) => void;
  onSelectRow: (row: FormApplicationBrowseResultModel) => void;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
