import { dateUtils } from '@v2/utils/date-utils';
import { CommentTextTypeEnum } from '../../enums/comment-text-type.enum';
import { CommentTypeEnum } from '../../enums/comment-type.enum';

export type IActionPlanBrowseCommentResultModel = {
  id: string;
  text: string | null;
  type: CommentTypeEnum;
  textType: CommentTextTypeEnum | null;
  approvedComment: string | null;
  isApproved: boolean | null;
  createdAt: Date;
};

export class ActionPlanBrowseCommentResultModel {
  id: string;
  text: string | null;
  type: CommentTypeEnum;
  textType: CommentTextTypeEnum | null;
  approvedComment: string | null;
  isApproved: boolean | null;
  createdAt: Date;

  constructor(params: IActionPlanBrowseCommentResultModel) {
    this.id = params.id;
    this.text = params.text;
    this.type = params.type;
    this.textType = params.textType;
    this.approvedComment = params.approvedComment;
    this.isApproved = params.isApproved;
    this.createdAt = params.createdAt;
  }

  get formatedCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }
}
