import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { FormModelOrderByEnum } from '@v2/services/forms/form/browse-form-model/service/browse-form-model.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';
import { FormModelColumnsEnum } from './enums/form-model-columns.enum';
import { FormBrowseResultModel } from '@v2/models/form/models/form/form-browse-result.model';

export interface IFormModelFilterProps {
  search?: string;
  types?: FormTypeEnum[];
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<FormModelOrderByEnum>[];
}

export interface IFormModelTableTableProps {
  data?: FormBrowseResultModel[];
  hiddenColumns: Record<FormModelColumnsEnum, boolean>;
  filterColumns: Partial<Record<FormModelColumnsEnum, ReactNode>>;
  setHiddenColumns: (
    hiddenColumns: Partial<Record<FormModelColumnsEnum, boolean>>,
  ) => void;
  isLoading?: boolean;
  filters: IFormModelFilterProps;
  setFilters: (values: IFormModelFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (order: IOrderByParams<FormModelOrderByEnum>) => void;
  onSelectRow: (row: FormBrowseResultModel) => void;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
