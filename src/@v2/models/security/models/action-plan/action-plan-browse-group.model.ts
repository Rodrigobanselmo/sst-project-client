import { ActionPlanStatusEnum } from '../../enums/action-plan-status.enum';
import { RecommendationTypeEnum } from '../../enums/recommendation-type.enum';
import { RiskTypeEnum } from '../../enums/risk-type.enum';
import {
  ActionPlanBrowseResultModel,
  IActionPlanBrowseResultModel,
} from './action-plan-browse-result.model';

export type IActionPlanBrowseGroupRisk = {
  id: string;
  name: string;
  type: RiskTypeEnum;
  subTypes?: { id: number; name: string }[];
  severity?: number | null;
};

export type IActionPlanBrowseGroupModel = {
  operationalActionId: string;
  workspaceId: string;
  recommendationIds: string[];
  recommendationLabels: string[];
  recommendation: {
    name: string | null;
    type: RecommendationTypeEnum | null;
    multiple: boolean;
  };
  risksCount: number;
  risks: IActionPlanBrowseGroupRisk[];
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
  operationalActionId: string;
  workspaceId: string;
  recommendationIds: string[];
  recommendationLabels: string[];
  recommendation: {
    name: string | null;
    type: RecommendationTypeEnum | null;
    multiple: boolean;
  };
  risksCount: number;
  risks: IActionPlanBrowseGroupRisk[];
  applicationsCount: number;
  status: ActionPlanStatusEnum | null;
  statusMultiple: boolean;
  responsible: { id: string; name: string } | null;
  responsibleMultiple: boolean;
  validDate: Date | null;
  validDateMultiple: boolean;
  applications: ActionPlanBrowseResultModel[];

  constructor(params: IActionPlanBrowseGroupModel) {
    this.operationalActionId = params.operationalActionId;
    this.workspaceId = params.workspaceId;
    this.recommendationIds = params.recommendationIds ?? [];
    this.recommendationLabels = params.recommendationLabels ?? [];
    this.recommendation = {
      name: params.recommendation?.name ?? null,
      type: params.recommendation?.type ?? null,
      multiple: params.recommendation?.multiple ?? false,
    };
    this.risks = (params.risks ?? []).map((risk) => ({
      ...risk,
      severity: risk.severity ?? null,
      subTypes: risk.subTypes ?? [],
    }));
    this.risksCount = params.risksCount ?? this.risks.length;
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
    return `${this.workspaceId}--${this.operationalActionId}`;
  }
}
