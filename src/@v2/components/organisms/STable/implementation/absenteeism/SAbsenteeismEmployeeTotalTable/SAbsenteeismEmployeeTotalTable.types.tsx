import { AbsenteeismTotalEmployeeResultBrowseModel } from '@v2/models/absenteeism/models/absenteeism-total-employee/absenteeism-total-employee-browse-result.model';
import { AbsenteeismEmployeeTotalOrderByEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-employee/service/browse-absenteeism-employee.service';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ReactNode } from 'react';
import { AbsenteeismColumnsEnum } from './enums/absenteeism-columns.enum';
import { TablesSelectEnum } from '../../../hooks/useTableSelect';

export interface IAbsenteeismFilterProps {
  search?: string;
  hierarchiesIds?: string[];
  page?: number;
  limit?: number;
  orderBy?: IOrderByParams<AbsenteeismEmployeeTotalOrderByEnum>[];
}

export interface IAbsenteeismTableProps {
  table: TablesSelectEnum.ABSENTEEISM_DASH_EMPLOYEE;
  data?: AbsenteeismTotalEmployeeResultBrowseModel[];
  filterColumns: Partial<Record<AbsenteeismColumnsEnum, ReactNode>>;
  isLoading?: boolean;
  showPagination?: boolean;
  filters: IAbsenteeismFilterProps;
  setFilters: (values: IAbsenteeismFilterProps) => void;
  setPage: (page: number) => void;
  setOrderBy: (
    order: IOrderByParams<AbsenteeismEmployeeTotalOrderByEnum>,
  ) => void;
  onSelectRow: (row: AbsenteeismTotalEmployeeResultBrowseModel) => void;
  pagination?: {
    total: number;
    limit: number;
    page: number;
  };
}
