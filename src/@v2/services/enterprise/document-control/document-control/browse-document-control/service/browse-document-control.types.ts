import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum DocumentControlOrderByEnum {
  NAME = 'NAME',
  TYPE = 'TYPE',
  DESCRIPTION = 'DESCRIPTION',
  START_DATE = 'START_DATE',
  END_DATE = 'END_DATE',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface BrowseDocumentControlParams {
  companyId: string;
  workspaceId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<DocumentControlOrderByEnum>[];
  filters?: {
    search?: string;
    types?: string[];
  };
}
