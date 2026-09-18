import type {
  BrowseRiskMatricesResponse,
  RiskMatrixBrowseItem,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

export function mapBrowseRiskMatrices(
  response: BrowseRiskMatricesResponse | null | undefined,
): RiskMatrixBrowseItem[] {
  return response?.results ?? [];
}

export function hasCatalogDraft(matrix: RiskMatrixBrowseItem) {
  return Boolean(matrix.draftVersion?.id);
}

export function catalogPublishedCoverageCount(matrix: RiskMatrixBrowseItem) {
  return matrix.latestPublishedVersion?.coverages.length ?? 0;
}
