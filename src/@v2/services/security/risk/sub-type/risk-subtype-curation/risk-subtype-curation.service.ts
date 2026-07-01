import { RiskSubtypeCurationRoutes } from '@v2/constants/routes/risk-subtype-curation.routes';
import { api } from 'core/services/apiClient';

import type {
  IBrowseCurationRisksParams,
  IBrowseCurationRisksResponse,
  IBulkRiskSubtypeResult,
} from './risk-subtype-curation.types';

export async function browseCurationRisks(
  params: IBrowseCurationRisksParams,
): Promise<IBrowseCurationRisksResponse> {
  const response = await api.get<IBrowseCurationRisksResponse>(
    RiskSubtypeCurationRoutes.RISKS,
    { params },
  );
  return response.data;
}

export async function bulkAssignRiskSubtype(params: {
  riskFactorIds: string[];
  subTypeId: number;
}): Promise<IBulkRiskSubtypeResult> {
  const response = await api.patch<IBulkRiskSubtypeResult>(
    RiskSubtypeCurationRoutes.BULK_ASSIGN,
    { ...params, mode: 'REPLACE' },
  );
  return response.data;
}

export async function bulkClearRiskSubtype(params: {
  riskFactorIds: string[];
}): Promise<IBulkRiskSubtypeResult> {
  const response = await api.patch<IBulkRiskSubtypeResult>(
    RiskSubtypeCurationRoutes.BULK_CLEAR,
    params,
  );
  return response.data;
}
