import { RiskTechnicalDataRoutes } from '@v2/constants/routes/risk-technical-data.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import {
  BrowseRiskTechnicalDataParams,
  RiskTechnicalData,
} from './risk-technical-data.types';

export async function browseRiskTechnicalData(
  params: BrowseRiskTechnicalDataParams,
  options?: { signal?: AbortSignal },
): Promise<RiskTechnicalData> {
  const response = await api.get<RiskTechnicalData>(
    bindUrlParams({
      path: RiskTechnicalDataRoutes.BROWSE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    options?.signal ? { signal: options.signal } : undefined,
  );

  return response.data;
}
