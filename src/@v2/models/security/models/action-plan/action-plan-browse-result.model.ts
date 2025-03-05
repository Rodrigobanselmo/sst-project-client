import { dateUtils } from '@v2/utils/date-utils';
import { ActionPlanStatusEnum } from '../../enums/action-plan-status.enum';
import { OriginTypeEnum } from '../../enums/origin-type.enum';
import { RecommendationTypeEnum } from '../../enums/recommendation-type.enum';
import { RiskTypeEnum } from '../../enums/risk-type.enum';
import { originTypeTranslation } from '../../translations/origin-type.translation';
import { IRiskLevelValues } from '../../types/risk-level-values.type';
import {
  ActionPlanBrowseCommentResultModel,
  IActionPlanBrowseCommentResultModel,
} from './action-plan-browse-comment-result.model';

export type IActionPlanBrowseResultModel = {
  uuid: { riskDataId: string; recommendationId: string; workspaceId: string };
  createdAt: Date;
  updatedAt: Date | null;
  startDate: Date | null;
  doneDate: Date | null;
  canceledDate: Date | null;
  validDate: Date | null;
  ocupationalRisk: IRiskLevelValues | null;
  recommendation: { name: string; type: RecommendationTypeEnum };
  generateSources: { id: string; name: string }[];
  risk: { id: string; name: string; type: RiskTypeEnum };
  origin: { id: string; name: string; type: OriginTypeEnum };
  status: ActionPlanStatusEnum;
  responsible: { id: string; name: string } | null;
  comments: IActionPlanBrowseCommentResultModel[];
};

export class ActionPlanBrowseResultModel {
  uuid: { riskDataId: string; recommendationId: string; workspaceId: string };
  createdAt: Date;
  updatedAt: Date | null;
  startDate: Date | null;
  doneDate: Date | null;
  canceledDate: Date | null;
  validDate: Date | null;
  ocupationalRisk: IRiskLevelValues;
  recommendation: { name: string; type: RecommendationTypeEnum };
  generateSource: { id: string; name: string }[];
  risk: { id: string; name: string; type: RiskTypeEnum };
  origin: { id: string; name: string; type: OriginTypeEnum };
  status: ActionPlanStatusEnum;
  responsible: { id: string; name: string } | null;
  comments: ActionPlanBrowseCommentResultModel[];

  constructor(params: IActionPlanBrowseResultModel) {
    this.uuid = params.uuid;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.startDate = params.startDate;
    this.doneDate = params.doneDate;
    this.canceledDate = params.canceledDate;
    this.ocupationalRisk = params.ocupationalRisk || 0;
    this.status = params.status;
    this.validDate = params.validDate ? new Date(params.validDate) : null;
    this.generateSource = params.generateSources;
    this.recommendation = params.recommendation;
    this.risk = params.risk;
    this.responsible = params.responsible;
    this.origin = params.origin;
    this.comments = params.comments.map(
      (comment) => new ActionPlanBrowseCommentResultModel(comment),
    );
  }

  get formatedDoneAt() {
    return this.validDate
      ? dateUtils(this.validDate).format('DD/MM/YYYY')
      : 'SEM PRAZO';
  }

  get formatedCreatedAt() {
    return dateUtils(this.createdAt).format('DD/MM/YYYY');
  }

  get formatedUpdatedAt() {
    return this.updatedAt
      ? dateUtils(this.updatedAt).format('DD/MM/YYYY')
      : this.formatedCreatedAt;
  }

  get id() {
    return `${this.uuid.riskDataId}--${this.uuid.recommendationId}--${this.uuid.workspaceId}`;
  }

  get originType() {
    return originTypeTranslation[this.origin.type];
  }

  get generateSourceNames() {
    return this.generateSource.map((source) => source.name).join(', ');
  }

  static fromId(id: string) {
    const [riskDataId, recommendationId, workspaceId] = id.split('--');
    return {
      riskDataId,
      recommendationId,
      workspaceId,
    };
  }
}
