import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum CoordinatorOrderByEnum {
  NAME = 'NAME',
}

export interface BrowseCoordinatorParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<CoordinatorOrderByEnum>[];
  filters?: {
    search?: string;
  };
}
