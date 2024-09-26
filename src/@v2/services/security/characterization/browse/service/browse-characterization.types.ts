import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum CharacterizationOrderByEnum {
  NAME = 'NAME',
  CREATED_AT = 'CREATED_AT',
  TYPE = 'TYPE',
  UPDATED_AT = 'UPDATED_AT',
  DONE_AT = 'DONE_AT',
  ORDER = 'ORDER',
  PHOTOS = 'PHOTOS',
  RISKS = 'RISKS',
  PROFILES = 'PROFILES',
}

export interface BrowseCharacterizationParams {
  companyId: string;
  workspaceId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<CharacterizationOrderByEnum>;
  filters?: {
    search?: string;
  };
}
