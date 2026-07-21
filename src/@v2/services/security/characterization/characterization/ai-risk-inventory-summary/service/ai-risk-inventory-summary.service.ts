import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  AiRiskInventorySummaryParams,
  AiRiskInventorySummaryResult,
} from './ai-risk-inventory-summary.types';

export async function aiRiskInventorySummary({
  companyId,
  workspaceId,
  characterizationId,
}: AiRiskInventorySummaryParams): Promise<AiRiskInventorySummaryResult> {
  const response = await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.AI_RISK_INVENTORY_SUMMARY,
      pathParams: { companyId, workspaceId, characterizationId },
    }),
  );

  return response.data;
}
