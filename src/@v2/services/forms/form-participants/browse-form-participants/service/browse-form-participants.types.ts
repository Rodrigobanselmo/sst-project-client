import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum FormParticipantsOrderByEnum {
  NAME = 'NAME',
  CPF = 'CPF',
  EMAIL = 'EMAIL',
  STATUS = 'STATUS',
  HIERARCHY_NAME = 'HIERARCHY_NAME',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface BrowseFormParticipantsFilters {
  search?: string;
  status?: string[];
  hierarchyIds?: string[];
}

export interface BrowseFormParticipantsParams {
  companyId: string;
  applicationId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<FormParticipantsOrderByEnum>[];
  filters?: BrowseFormParticipantsFilters;
}
