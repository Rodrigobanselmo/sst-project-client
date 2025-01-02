import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum CommentCreatorOrderByEnum {
  NAME = 'NAME',
}

export interface BrowseCommentCreatorParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<CommentCreatorOrderByEnum>[];
  filters?: {
    search?: string;
  };
}
