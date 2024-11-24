import { IOrderByParams } from '@v2/types/order-by-params.type';

export enum AllWorkspacesOrderByEnum {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface BrowseAllWorkspacesParams {
  companyId: string;
  orderBy?: IOrderByParams<AllWorkspacesOrderByEnum>[];
  filters?: {
    //
  };
}
