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

export type FormParticipantsResponseFilter = 'all' | 'responded' | 'not_responded';

export interface BrowseFormParticipantsFilters {
  search?: string;
  hierarchyIds?: string[];
  workspaceIds?: string[];
  /** true = respondeu; false = não respondeu; omitido = todos */
  hasResponded?: boolean;
}

export interface BrowseFormParticipantsParams {
  companyId: string;
  applicationId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<FormParticipantsOrderByEnum>[];
  filters?: BrowseFormParticipantsFilters;
}
