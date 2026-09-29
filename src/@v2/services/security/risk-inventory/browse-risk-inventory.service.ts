import { RiskInventoryRoutes } from '@v2/constants/routes/risk-inventory.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import {
  BrowseRiskInventoryParams,
  RiskInventoryBrowseResult,
} from './risk-inventory.types';

export async function browseRiskInventory(
  params: BrowseRiskInventoryParams,
  options?: { signal?: AbortSignal },
): Promise<RiskInventoryBrowseResult> {
  const response = await api.get<RiskInventoryBrowseResult>(
    bindUrlParams({
      path: RiskInventoryRoutes.BROWSE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    options?.signal ? { signal: options.signal } : undefined,
  );

  return response.data;
}
