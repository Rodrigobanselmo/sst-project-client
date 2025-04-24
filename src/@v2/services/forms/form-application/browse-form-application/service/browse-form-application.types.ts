import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum FormApplicationOrderByEnum {
  NAME = 'NAME',
  DESCRIPTION = 'DESCRIPTION',
  STATUS = 'STATUS',
  START_DATE = 'START_DATE',
  END_DATE = 'END_DATE',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}

export interface BrowseFormApplicationParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<FormApplicationOrderByEnum>[];
  filters?: {
    search?: string;
    status?: FormApplicationStatusEnum[];
  };
}
