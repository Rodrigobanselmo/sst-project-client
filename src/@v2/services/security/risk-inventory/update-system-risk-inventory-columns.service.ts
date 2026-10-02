import { RiskInventoryRoutes } from '@v2/constants/routes/risk-inventory.routes';
import { api } from 'core/services/apiClient';

import {
  RiskInventoryColumnSetting,
  RiskInventoryColumnsPreference,
  RiskInventoryExtraColumnSetting,
  RiskInventoryOptionalColumnSetting,
} from './risk-inventory.types';

export async function updateSystemRiskInventoryColumns(params: {
  columns: RiskInventoryColumnSetting[];
  extraColumns?: RiskInventoryExtraColumnSetting[];
  optionalColumns?: RiskInventoryOptionalColumnSetting[];
  columnOrder?: string[];
}): Promise<{ columnPreference: RiskInventoryColumnsPreference; updatedById: number | null }> {
  const response = await api.put<{
    columnPreference: RiskInventoryColumnsPreference;
    updatedById: number | null;
  }>(RiskInventoryRoutes.SYSTEM_COLUMNS, {
    columns: params.columns,
    extraColumns: params.extraColumns ?? [],
    optionalColumns: params.optionalColumns ?? [],
    ...(params.columnOrder?.length ? { columnOrder: params.columnOrder } : {}),
  });

  return response.data;
}
