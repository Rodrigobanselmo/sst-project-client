import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

export type FilterCatalogOnlyAiSuggestionsResult = {
  accepted: DetailedRisk[];
  apiReturnedCount: number;
  discardedInvalidCatalog: number;
  discardedAlreadyLinked: number;
};

/**
 * Valida sugestões da API contra o catálogo já carregado e vínculos diretos.
 * Não trata “cache ausente”: o caller deve garantir catálogo carregado.
 * Fatores herdados não entram em existingDirectRiskIds.
 */
export function filterCatalogOnlyAiSuggestions(params: {
  incoming: DetailedRisk[];
  catalogIds: Set<string>;
  existingDirectRiskIds: Set<string>;
}): FilterCatalogOnlyAiSuggestionsResult {
  const apiReturnedCount = params.incoming.length;
  let discardedInvalidCatalog = 0;
  let discardedAlreadyLinked = 0;
  const accepted: DetailedRisk[] = [];
  const seen = new Set<string>();

  for (const risk of params.incoming) {
    if (!risk?.id || seen.has(risk.id)) continue;
    seen.add(risk.id);

    if (!params.catalogIds.has(risk.id)) {
      discardedInvalidCatalog += 1;
      continue;
    }
    if (params.existingDirectRiskIds.has(risk.id)) {
      discardedAlreadyLinked += 1;
      continue;
    }
    accepted.push(risk);
  }

  return {
    accepted,
    apiReturnedCount,
    discardedInvalidCatalog,
    discardedAlreadyLinked,
  };
}
