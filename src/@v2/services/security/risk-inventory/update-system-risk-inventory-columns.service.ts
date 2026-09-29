import { RiskInventoryRoutes } from '@v2/constants/routes/risk-inventory.routes';
import { api } from 'core/services/apiClient';

import {
  RiskInventoryColumnSetting,
  RiskInventoryColumnsPreference,
} from './risk-inventory.types';

export async function updateSystemRiskInventoryColumns(params: {
  columns: RiskInventoryColumnSetting[];
}): Promise<{ columnPreference: RiskInventoryColumnsPreference; updatedById: number | null }> {
  const response = await api.put<{
    columnPreference: RiskInventoryColumnsPreference;
    updatedById: number | null;
  }>(RiskInventoryRoutes.SYSTEM_COLUMNS, { columns: params.columns });

  return response.data;
}
