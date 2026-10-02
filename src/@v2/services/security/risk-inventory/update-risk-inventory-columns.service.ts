import { RiskInventoryRoutes } from '@v2/constants/routes/risk-inventory.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import {
  RiskInventoryColumnSetting,
  RiskInventoryColumnsPreference,
  RiskInventoryExtraColumnSetting,
  RiskInventoryOptionalColumnSetting,
} from './risk-inventory.types';

export async function updateRiskInventoryColumns(params: {
  companyId: string;
  workspaceId: string;
  columns: RiskInventoryColumnSetting[] | null;
  extraColumns?: RiskInventoryExtraColumnSetting[];
  optionalColumns?: RiskInventoryOptionalColumnSetting[];
  columnOrder?: string[];
}): Promise<{ columnPreference: RiskInventoryColumnsPreference | null }> {
  const response = await api.patch<{ columnPreference: RiskInventoryColumnsPreference | null }>(
    bindUrlParams({
      path: RiskInventoryRoutes.COLUMNS,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    params.columns === null
      ? { columns: null }
      : {
          columns: params.columns,
          extraColumns: params.extraColumns ?? [],
          optionalColumns: params.optionalColumns ?? [],
          ...(params.columnOrder?.length ? { columnOrder: params.columnOrder } : {}),
        },
  );

  return response.data;
}
