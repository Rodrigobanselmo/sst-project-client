import { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

/**
 * Keeps only AI suggestions that are not already linked to the GSE
 * (or already added in this session). Does not mutate the session store.
 */
export function filterNewAiRiskSuggestions(params: {
  suggestions: DetailedRisk[];
  existingRiskIds: Set<string>;
  addedRiskIds?: Set<string>;
}): DetailedRisk[] {
  const { suggestions, existingRiskIds, addedRiskIds } = params;

  return suggestions.filter((risk) => {
    if (existingRiskIds.has(risk.id)) return false;
    if (addedRiskIds?.has(risk.id)) return false;
    return true;
  });
}
