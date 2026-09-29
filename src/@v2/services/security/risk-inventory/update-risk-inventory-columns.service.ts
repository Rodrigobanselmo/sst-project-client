import { RiskInventoryRoutes } from '@v2/constants/routes/risk-inventory.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import {
  RiskInventoryColumnSetting,
  RiskInventoryColumnsPreference,
} from './risk-inventory.types';

export async function updateRiskInventoryColumns(params: {
  companyId: string;
  workspaceId: string;
  columns: RiskInventoryColumnSetting[] | null;
}): Promise<{ columnPreference: RiskInventoryColumnsPreference | null }> {
  const response = await api.patch<{ columnPreference: RiskInventoryColumnsPreference | null }>(
    bindUrlParams({
      path: RiskInventoryRoutes.COLUMNS,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    { columns: params.columns },
  );

  return response.data;
}
