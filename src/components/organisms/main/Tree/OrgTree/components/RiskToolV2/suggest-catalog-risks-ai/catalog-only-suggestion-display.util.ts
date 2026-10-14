import type {
  CatalogOnlySuggestionOrigin,
  CatalogOnlyTechnicalConsideration,
  DetailedRisk,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

export function resolveCatalogOnlyOriginLabel(
  origin?: CatalogOnlySuggestionOrigin,
): string {
  if (origin === 'USER_REQUESTED') return 'Solicitado por você';
  return 'Sugestão da IA';
}

export function resolveCatalogOnlyConsiderationLabel(
  consideration?: CatalogOnlyTechnicalConsideration,
): string | null {
  if (consideration === 'PERTINENCE_IDENTIFIED') return 'Pertinência identificada';
  if (consideration === 'PERTINENCE_NOT_DEMONSTRATED') {
    return 'Pertinência não demonstrada';
  }
  if (consideration === 'INCONCLUSIVE') return 'Avaliação inconclusiva';
  return null;
}

export function shouldWarnCatalogOnlyConsideration(
  risk: Pick<DetailedRisk, 'suggestionOrigin' | 'technicalConsideration'>,
): boolean {
  if (risk.suggestionOrigin !== 'USER_REQUESTED') return false;
  return (
    risk.technicalConsideration === 'PERTINENCE_NOT_DEMONSTRATED' ||
    risk.technicalConsideration === 'INCONCLUSIVE'
  );
}
