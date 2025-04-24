import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum FormModelOrderByEnum {
  NAME = 'NAME',
  TYPE = 'TYPE',
  DESCRIPTION = 'DESCRIPTION',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface BrowseFormModelParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<FormModelOrderByEnum>[];
  filters?: {
    search?: string;
    types?: FormTypeEnum[];
  };
}
