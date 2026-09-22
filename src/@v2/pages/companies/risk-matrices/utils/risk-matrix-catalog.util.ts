import {
  CompanyRiskMatrixStatusEnum,
  type BrowseRiskMatricesResponse,
  type RiskMatrixBrowseItem,
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

export function canOpenWorkspaceAvailability(matrix: RiskMatrixBrowseItem) {
  return (
    matrix.status === CompanyRiskMatrixStatusEnum.ACTIVE &&
    Boolean(matrix.latestPublishedVersion?.id)
  );
}

/** CUSTOM com versão publicada: consulta read-only da versão PUBLISHED imutável. */
export function canViewPublishedRiskMatrix(matrix: RiskMatrixBrowseItem) {
  return Boolean(matrix.latestPublishedVersion?.id);
}

export function canDuplicateRiskMatrix(matrix: RiskMatrixBrowseItem) {
  return Boolean(matrix.latestPublishedVersion?.id || matrix.draftVersion?.id);
}

export function canDeleteCatalogDraft(matrix: RiskMatrixBrowseItem) {
  return Boolean(matrix.draftVersion?.id);
}

export function deleteCatalogDraftRemovesIdentity(matrix: RiskMatrixBrowseItem) {
  return Boolean(matrix.draftVersion?.id) && !matrix.latestPublishedVersion?.id;
}

export function catalogEstablishmentAvailabilityLabel(
  matrix: RiskMatrixBrowseItem,
) {
  if (!matrix.latestPublishedVersion?.id) return null;
  if (!matrix.hasActiveBindings) return 'Nenhum estabelecimento';
  return null;
}
