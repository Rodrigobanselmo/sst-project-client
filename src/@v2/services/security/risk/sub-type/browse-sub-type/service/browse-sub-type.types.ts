import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum SubTypeOrderByEnum {
  NAME = 'NAME',
  TYPE = 'TYPE',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface BrowseSubTypeParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<SubTypeOrderByEnum>[];
  filters?: {
    search?: string;
    types?: RiskTypeEnum[];
  };
}
