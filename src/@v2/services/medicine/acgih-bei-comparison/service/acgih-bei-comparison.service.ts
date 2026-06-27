import { AcgihBeiComparisonRoutes } from '@v2/constants/routes/acgih-bei-comparison.routes';
import { api } from 'core/services/apiClient';

import type {
  IApplyAcgihReferencePayload,
  IApplyAcgihReferenceResponse,
  IBrowseAcgihBeiComparisonParams,
  IBrowseAcgihBeiComparisonResponse,
} from './acgih-bei-comparison.types';

export async function browseAcgihBeiComparison(
  params: IBrowseAcgihBeiComparisonParams,
): Promise<IBrowseAcgihBeiComparisonResponse> {
  const response = await api.get<IBrowseAcgihBeiComparisonResponse>(
    AcgihBeiComparisonRoutes.BASE,
    { params },
  );
  return response.data;
}

/**
 * Fase 4I — adiciona a ACGIH/BEI como fonte complementar de uma regra
 * EXISTENTE. O servidor recalcula a elegibilidade e resolve a regra de destino.
 */
export async function applyAcgihReference(
  payload: IApplyAcgihReferencePayload,
): Promise<IApplyAcgihReferenceResponse> {
  const response = await api.post<IApplyAcgihReferenceResponse>(
    AcgihBeiComparisonRoutes.REFERENCES,
    payload,
  );
  return response.data;
}
