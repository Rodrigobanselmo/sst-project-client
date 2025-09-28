import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum FormParticipantsOrderByEnum {
  NAME = 'NAME',
  CPF = 'CPF',
  HIERARCHY = 'HIERARCHY',
  STATUS = 'STATUS',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  HAS_RESPONDED = 'HAS_RESPONDED',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
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
