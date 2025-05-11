import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum TaskResponsibleOrderByEnum {
  NAME = 'NAME',
}

export interface BrowseTaskResponsibleParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<TaskResponsibleOrderByEnum>[];
  filters?: {
    search?: string;
  };
}
