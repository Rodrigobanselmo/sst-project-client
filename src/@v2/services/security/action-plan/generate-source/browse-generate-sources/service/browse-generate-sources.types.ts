import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum GenerateSourceOrderByEnum {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface BrowseGenerateSourcesParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<GenerateSourceOrderByEnum>[];
  filters?: {
    search?: string;
    riskIds?: string[];
  };
}
