import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum FormHierarchyOrderByEnum {
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  NAME = 'NAME',
  PARENT_NAME_1 = 'PARENT_1',
  PARENT_NAME_2 = 'PARENT_2',
  PARENT_NAME_3 = 'PARENT_3',
  PARENT_NAME_4 = 'PARENT_4',
  PARENT_NAME_5 = 'PARENT_5',
  TYPE = 'TYPE',
}

export interface BrowseFormHierarchiesParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<FormHierarchyOrderByEnum>[];
  filters?: {
    search?: string;
    workspaceIds?: string[];
    type?: HierarchyTypeEnum[];
  };
}
