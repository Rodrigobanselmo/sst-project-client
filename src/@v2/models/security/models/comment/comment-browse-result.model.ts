import { dateUtils } from '@v2/utils/date-utils';
import { ActionPlanStatusEnum } from '../../enums/action-plan-status.enum';
import { CommentApprovedStatusEnum } from '../../enums/comment-approved-status.enum';
import { CommentTextTypeEnum } from '../../enums/comment-text-type.enum';
import { CommentTypeEnum } from '../../enums/comment-type.enum';
import { OriginTypeEnum } from '../../enums/origin-type.enum';
import { ActionPlanStatusTypeTranslate } from '../../translations/action-plan-status-type.translaton';
import { originTypeTranslation } from '../../translations/origin-type.translation';

export type ICommentBrowseResultModel = {
  id: string;
  workspaceId: string;
  riskDataId: string;
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

  origin: {
    name: string;
    type: OriginTypeEnum;
  };

  recommendation: {
    name: string;
    id: string;
  };

  generateSources: {
    id: string;
    name: string;
  }[];

  approvedBy: { id: number; name: string; email: string } | null;
  createdBy: { id: number; name: string; email: string } | null;
};

export class CommentBrowseResultModel {
  id: string;
  workspaceId: string;
  riskDataId: string;
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

  origin: {
    name: string;
    type: OriginTypeEnum;
  };

  recommendation: {
    name: string;
    id: string;
  };

  generateSources: {
    id: string;
    name: string;
  }[];

  approvedBy: { id: number; name: string; email: string } | null;
  createdBy: { id: number; name: string; email: string } | null;

  constructor(params: ICommentBrowseResultModel) {
    this.id = params.id;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.workspaceId = params.workspaceId;
    this.riskDataId = params.riskDataId;

    this.text = params.text;
    this.type = params.type;
    this.textType = params.textType;
    this.isApproved = params.isApproved;
    this.approvedAt = params.approvedAt;
    this.approvedComment = params.approvedComment;
    this.origin = params.origin;
    this.recommendation = params.recommendation;
    this.generateSources = params.generateSources;

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

  get originType() {
    return originTypeTranslation[this.origin.type];
  }

  get isCanceled() {
    return this.type === CommentTypeEnum.CANCELED;
  }

  get isDone() {
    return this.type === CommentTypeEnum.DONE;
  }

  get isPostponed() {
    return this.type === CommentTypeEnum.POSTPONED;
  }

  get formatedChanges() {
    const isChangeStatus = this.isCanceled || this.isDone;

    if (isChangeStatus) {
      return `${
        this.changes.previousStatus
          ? ActionPlanStatusTypeTranslate[this.changes.previousStatus]
          : ''
      } -> ${
        this.changes.status
          ? ActionPlanStatusTypeTranslate[this.changes.status]
          : '-'
      }`;
    }

    if (this.isPostponed) {
      return `Adiado para ${dateUtils(this.changes.validDate).format(
        'DD/MM/YYYY',
      )}`;
    }

    return '';
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
