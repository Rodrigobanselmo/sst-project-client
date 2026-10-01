import { RiskTechnicalDataRoutes } from '@v2/constants/routes/risk-technical-data.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import {
  RiskTechnicalColumnSetting,
  RiskTechnicalData,
  RiskTechnicalDataGroup,
} from './risk-technical-data.types';

export async function updateRiskTechnicalDataColumns(params: {
  companyId: string;
  workspaceId: string;
  family: RiskTechnicalDataGroup;
  columns: RiskTechnicalColumnSetting[] | null;
}): Promise<RiskTechnicalData['columns']> {
  const response = await api.patch<RiskTechnicalData['columns']>(
    bindUrlParams({
      path: RiskTechnicalDataRoutes.COLUMNS,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
      },
    }),
    { family: params.family, columns: params.columns },
  );

  return response.data;
}
