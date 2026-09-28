import { RiskPrioritizationRoutes } from '@v2/constants/routes/risk-prioritization.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { PrioritizationMatrixOrientation } from './risk-prioritization.types';

export async function updateRiskPrioritizationOrientation(params: {
  companyId: string;
  workspaceId: string;
  orientation: PrioritizationMatrixOrientation;
}): Promise<{ matrixOrientation: PrioritizationMatrixOrientation }> {
  const response = await api.patch<{ matrixOrientation: PrioritizationMatrixOrientation }>(
    bindUrlParams({
      path: RiskPrioritizationRoutes.ORIENTATION,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    { orientation: params.orientation },
  );

  return response.data;
}
