import { RiskTechnicalDataRoutes } from '@v2/constants/routes/risk-technical-data.routes';
import { api } from 'core/services/apiClient';

import {
  RiskTechnicalColumnSetting,
  RiskTechnicalDataGroup,
} from './risk-technical-data.types';

export async function updateSystemRiskTechnicalDataColumns(params: {
  family: RiskTechnicalDataGroup;
  columns: RiskTechnicalColumnSetting[];
}) {
  const response = await api.put(RiskTechnicalDataRoutes.SYSTEM_COLUMNS, {
    family: params.family,
    columns: params.columns,
  });
  return response.data;
}
