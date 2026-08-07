import { api } from 'core/services/apiClient';
import { ApiRoutesEnum } from 'core/enums/api-routes.enums';

export const RISK_HARD_DELETE_CONFIRMATION = 'EXCLUIR DEFINITIVAMENTE';

export type RiskDeletionImpactCompanyRow = {
  companyId: string;
  companyName: string;
  workspaceId: string | null;
  workspaceName: string | null;
  inventoryCount: number;
  hasActionPlan: boolean;
  actionPlanItemCount: number;
};

export type RiskDeletionImpactReport = {
  riskId: string;
  riskName: string;
  system: boolean;
  companyId: string;
  status: string;
  deletedAt: string | null;
  inventoryOccurrenceTotal: number;
  actionPlanItemTotal: number;
  companies: RiskDeletionImpactCompanyRow[];
  confirmationRequired: string;
};

export async function fetchRiskDeletionImpact(riskId: string) {
  const { data } = await api.get<RiskDeletionImpactReport>(
    `${ApiRoutesEnum.RISK}/deletion-impact/${riskId}`,
  );
  return data;
}

export async function hardDeleteRiskFactor(
  riskId: string,
  confirmation: string,
) {
  const { data } = await api.post<{
    deleted: boolean;
    riskId: string;
    riskName: string;
  }>(`${ApiRoutesEnum.RISK}/hard-delete/${riskId}`, { confirmation });
  return data;
}
