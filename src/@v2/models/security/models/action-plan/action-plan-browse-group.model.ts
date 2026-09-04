import { ActionPlanStatusEnum } from '../../enums/action-plan-status.enum';
import { RecommendationTypeEnum } from '../../enums/recommendation-type.enum';
import { RiskTypeEnum } from '../../enums/risk-type.enum';
import {
  ActionPlanBrowseResultModel,
  IActionPlanBrowseResultModel,
} from './action-plan-browse-result.model';

export type IActionPlanBrowseGroupModel = {
  uuid: { recommendationId: string; workspaceId: string };
  recommendation: { name: string; type: RecommendationTypeEnum };
  risk: {
    id: string;
    name: string;
    type: RiskTypeEnum;
    subTypes?: { id: number; name: string }[];
    severity: number | null;
  };
  applicationsCount: number;
  status: ActionPlanStatusEnum | null;
  statusMultiple: boolean;
  responsible: { id: string; name: string } | null;
  responsibleMultiple: boolean;
  validDate: Date | null;
  validDateMultiple: boolean;
  applications: IActionPlanBrowseResultModel[];
};

export class ActionPlanBrowseGroupModel {
  uuid: { recommendationId: string; workspaceId: string };
  recommendation: { name: string; type: RecommendationTypeEnum };
  risk: {
    id: string;
    name: string;
    type: RiskTypeEnum;
    subTypes?: { id: number; name: string }[];
    severity: number | null;
  };
  applicationsCount: number;
  status: ActionPlanStatusEnum | null;
  statusMultiple: boolean;
  responsible: { id: string; name: string } | null;
  responsibleMultiple: boolean;
  validDate: Date | null;
  validDateMultiple: boolean;
  applications: ActionPlanBrowseResultModel[];

  constructor(params: IActionPlanBrowseGroupModel) {
    this.uuid = params.uuid;
    this.recommendation = params.recommendation;
    this.risk = {
      ...params.risk,
      severity: params.risk.severity ?? null,
      subTypes: params.risk.subTypes ?? [],
    };
    this.applicationsCount = params.applicationsCount;
    this.status = params.status;
    this.statusMultiple = params.statusMultiple;
    this.responsible = params.responsible;
    this.responsibleMultiple = params.responsibleMultiple;
    this.validDate = params.validDate ? new Date(params.validDate) : null;
    this.validDateMultiple = params.validDateMultiple;
    this.applications = params.applications.map(
      (application) => new ActionPlanBrowseResultModel(application),
    );
  }

  get id() {
    return `${this.uuid.workspaceId}--${this.uuid.recommendationId}`;
  }
}
