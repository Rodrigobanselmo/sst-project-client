import { dateUtils } from '@v2/utils/date-utils';
import { ActionPlanStatusEnum } from '../../enums/action-plan-status.enum';
import { CommentTextTypeEnum } from '../../enums/comment-text-type.enum';
import { CommentTypeEnum } from '../../enums/comment-type.enum';
import { CommentApprovedStatusEnum } from '../../enums/comment-approved-status.enum';

export type ICommentBrowseResultModel = {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;

  text: string | null;
  type: CommentTypeEnum;
  textType: CommentTextTypeEnum | null;
  isApproved: boolean | null;
  approvedAt: Date | null;
  approvedComment: string | null;

  changes: {
    status: ActionPlanStatusEnum | undefined;
    previousStatus: ActionPlanStatusEnum | undefined;
    validDate: Date | undefined;
    previousValidDate: Date | undefined;
  };
  approvedBy: { id: number; name: string; email: string } | null;
  createdBy: { id: number; name: string; email: string } | null;
};

export class CommentBrowseResultModel {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;

  text: string | null;
  type: CommentTypeEnum;
  textType: CommentTextTypeEnum | null;
  isApproved: boolean | null;
  approvedAt: Date | null;
  approvedComment: string | null;

  changes: {
    status: ActionPlanStatusEnum | undefined;
    previousStatus: ActionPlanStatusEnum | undefined;
    validDate: Date | undefined;
    previousValidDate: Date | undefined;
  };

  approvedBy: { id: number; name: string; email: string } | null;
  createdBy: { id: number; name: string; email: string } | null;

  constructor(params: ICommentBrowseResultModel) {
    this.id = params.id;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;

    this.text = params.text;
    this.type = params.type;
    this.textType = params.textType;
    this.isApproved = params.isApproved;
    this.approvedAt = params.approvedAt;
    this.approvedComment = params.approvedComment;

    this.changes = params.changes;
    this.approvedBy = params.approvedBy;
    this.createdBy = params.createdBy;
  }

  get approvedStatus() {
    if (this.isApproved === null) return CommentApprovedStatusEnum.NONE;
    return this.isApproved
      ? CommentApprovedStatusEnum.APPROVED
      : CommentApprovedStatusEnum.REJECTED;
  }

  get formatedCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formatedUpdatedAt() {
    return this.updatedAt
      ? dateUtils(this.updatedAt).format('DD/MM/YYYY')
      : this.formatedCreatedAt;
  }
}
