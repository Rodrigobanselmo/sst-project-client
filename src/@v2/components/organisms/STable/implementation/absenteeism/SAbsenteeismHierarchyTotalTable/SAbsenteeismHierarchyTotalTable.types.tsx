import { AbsenteeismTotalHierarchyResultBrowseModel } from '@v2/models/absenteeism/models/absenteeism-total-hierarchy/absenteeism-total-hierarchy-browse-result.model';
import {
  AbsenteeismHierarchyTotalOrderByEnum,
  AbsenteeismHierarchyTypeEnum,
} from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';
import { TablesSelectEnum } from '../../../hooks/useTableSelect';
import { AbsenteeismColumnsEnum } from './enums/absenteeism-columns.enum';
import { AbsenteeismTotalHierarchyBrowseModel } from '@v2/models/absenteeism/models/absenteeism-total-hierarchy/absenteeism-total-hierarchy-browse.model';

export interface IAbsenteeismFilterProps {
  search?: string;
  hierarchiesIds?: string[];
  type?: AbsenteeismHierarchyTypeEnum | null;
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<AbsenteeismHierarchyTotalOrderByEnum>[];
}

export interface IAbsenteeismTableProps {
  table: TablesSelectEnum.ABSENTEEISM_DASH_HIERARCHY;
  data?: AbsenteeismTotalHierarchyBrowseModel;
  filterColumns: Partial<Record<AbsenteeismColumnsEnum, ReactNode>>;
  isLoading?: boolean;
  showPagination?: boolean;
  filters: IAbsenteeismFilterProps;
  setFilters: (values: IAbsenteeismFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (
    order: IOrderByParams<AbsenteeismHierarchyTotalOrderByEnum>,
  ) => void;
  onSelectRow: (row: AbsenteeismTotalHierarchyResultBrowseModel) => void;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
