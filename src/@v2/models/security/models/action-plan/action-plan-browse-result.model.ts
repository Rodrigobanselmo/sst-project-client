import { dateUtils } from '@v2/utils/date-utils';
import { CharacterizationTypeEnum } from '../../enums/characterization-type.enum';
import { HierarchyTypeEnum } from '../../enums/hierarchy-type.enum';
import { IRiskLevelValues } from '../../types/risk-level-values.type';
import { RecommendationTypeEnum } from '../../enums/recommendation-type.enum';
import { RiskTypeEnum } from '../../enums/risk-type.enum';
import { OriginTypeEnum } from '../../enums/origin-type.enum';
import { ActionPlanStatusEnum } from '../../enums/action-plan-status.enum';
import { originTypeTranslation } from '../../translations/origin-type.translation';

export type IActionPlanBrowseResultModel = {
  uuid: { riskDataId: string; recommendationId: string };
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
  origin: { name: string; type: OriginTypeEnum };
  status: ActionPlanStatusEnum;
  hierarchies: { name: string; type: HierarchyTypeEnum }[];
  responsible: { id: string; name: string } | null;
};

export class ActionPlanBrowseResultModel {
  uuid: { riskDataId: string; recommendationId: string };
  createdAt: Date;
  updatedAt: Date | null;
  startDate: Date | null;
  doneDate: Date | null;
  canceledDate: Date | null;
  validDate: Date | null;
  ocupationalRisk: IRiskLevelValues | null;
  recommendation: { name: string; type: RecommendationTypeEnum };
  generateSource: { id: string; name: string }[];
  risk: { id: string; name: string; type: RiskTypeEnum };
  origin: { name: string; type: OriginTypeEnum };
  status: ActionPlanStatusEnum;
  hierarchies: { name: string; type: HierarchyTypeEnum }[];
  responsible: { id: string; name: string } | null;

  constructor(params: IActionPlanBrowseResultModel) {
    this.uuid = params.uuid;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.startDate = params.startDate;
    this.doneDate = params.doneDate;
    this.canceledDate = params.canceledDate;
    this.ocupationalRisk = params.ocupationalRisk;
    this.status = params.status;
    this.validDate = params.validDate;
    this.generateSource = params.generateSources;
    this.recommendation = params.recommendation;
    this.risk = params.risk;
    this.responsible = params.responsible;
    this.hierarchies = params.hierarchies;
    this.origin = params.origin;
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
    return this.uuid.riskDataId + this.uuid.recommendationId;
  }

  get originType() {
    return originTypeTranslation[this.origin.type];
  }

  get generateSourceNames() {
    return this.generateSource.map((source) => source.name).join(', ');
  }
}
