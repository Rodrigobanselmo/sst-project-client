import { RiskPrioritizationRoutes } from '@v2/constants/routes/risk-prioritization.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import {
  BrowseRiskPrioritizationParams,
  RiskPrioritizationBrowseResult,
} from './risk-prioritization.types';

export async function browseRiskPrioritization(
  params: BrowseRiskPrioritizationParams,
  options?: { signal?: AbortSignal },
): Promise<RiskPrioritizationBrowseResult> {
  const response = await api.get<RiskPrioritizationBrowseResult>(
    bindUrlParams({
      path: RiskPrioritizationRoutes.BROWSE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    options?.signal ? { signal: options.signal } : undefined,
  );

  return response.data;
}
