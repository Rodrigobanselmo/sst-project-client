import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum ResponsibleOrderByEnum {
  NAME = 'NAME',
}

export interface BrowseResponsibleParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<ResponsibleOrderByEnum>[];
  filters?: {
    search?: string;
  };
}
