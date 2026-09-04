import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/action-plan/browse-action-plan/service/browse-action-plan.types';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { RiskTypeEnum } from '@v2/models/security/enums/risk-type.enum';
import { IOrderByParams } from '@v2/types/order-by-params.type';

export type ActionPlanDocumentFormat = 'detailed' | 'grouped';

export interface DownloadActionPlanDocumentParams {
  companyId: string;
  workspaceId: string;
  format: ActionPlanDocumentFormat;
  applyScreenFilters: true;
  search?: string;
  status?: ActionPlanStatusEnum[];
  responsibleIds?: number[];
  occupationalRisks?: number[];
  isExpired?: boolean;
  hierarchyIds?: string[];
  recommendationIds?: string[];
  generateSourceIds?: string[];
  riskIds?: string[];
  riskTypes?: RiskTypeEnum[];
  riskSubTypes?: number[];
  orderBy?: IOrderByParams<ActionPlanOrderByEnum>[];
}
