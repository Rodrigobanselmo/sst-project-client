import { CommentTextTypeEnum } from '@v2/models/security/enums/comment-text-type.enum';
import { CommentTypeEnum } from '@v2/models/security/enums/comment-type.enum';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { IPaginationParams } from '@v2/types/pagination-params.type';

export enum CommentOrderByEnum {
  CREATOR = 'CREATOR',
  IS_APPROVED = 'IS_APPROVED',
  APPROVED_BY = 'APPROVED_BY',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
  TEXT_TYPE = 'TEXT_TYPE',
  TYPE = 'TYPE',
}

export interface BrowseCommentsParams {
  companyId: string;
  pagination: IPaginationParams;
  orderBy?: IOrderByParams<CommentOrderByEnum>[];
  filters?: {
    search?: string;
    creatorsIds?: number[];
    type?: CommentTypeEnum[];
    textType?: CommentTextTypeEnum[];
    workspaceIds?: string[];
    isApproved?: boolean | null;
  };
}
