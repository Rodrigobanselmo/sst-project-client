import { AcgihBeiComparisonRoutes } from '@v2/constants/routes/acgih-bei-comparison.routes';
import { api } from 'core/services/apiClient';

import type {
  IApplyAcgihReferencePayload,
  IApplyAcgihReferenceResponse,
  IBrowseAcgihBeiComparisonParams,
  IBrowseAcgihBeiComparisonResponse,
  IRemoveComparisonReviewResponse,
  IUpsertComparisonReviewPayload,
  IUpsertComparisonReviewResponse,
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

/**
 * 4O.1 — registra/atualiza a decisão técnica de uma linha da comparação. O
 * servidor recalcula a comparação e grava os snapshots. Não altera as bases.
 */
export async function upsertComparisonReview(
  payload: IUpsertComparisonReviewPayload,
): Promise<IUpsertComparisonReviewResponse> {
  const response = await api.post<IUpsertComparisonReviewResponse>(
    AcgihBeiComparisonRoutes.REVIEWS,
    payload,
  );
  return response.data;
}

/** 4O.1 — limpa/reabre a decisão técnica (soft-delete). */
export async function removeComparisonReview(
  acgihBeiIndicatorId: string,
): Promise<IRemoveComparisonReviewResponse> {
  const response = await api.delete<IRemoveComparisonReviewResponse>(
    AcgihBeiComparisonRoutes.REVIEW_BY_ID(acgihBeiIndicatorId),
  );
  return response.data;
}
