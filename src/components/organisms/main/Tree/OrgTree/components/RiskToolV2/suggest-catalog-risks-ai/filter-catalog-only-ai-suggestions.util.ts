import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

export type FilterCatalogOnlyAiSuggestionsResult = {
  /** Novas oportunidades de inclusão (checkbox). */
  accepted: DetailedRisk[];
  /** Fatores que a IA identificou e que já estão vinculados (somente leitura). */
  recognizedAlreadyLinked: DetailedRisk[];
  apiReturnedNewCount: number;
  apiReturnedAlreadyLinkedCount: number;
  discardedInvalidCatalog: number;
  /** Itens de `incoming` novos que o client ainda vê como já vinculados. */
  discardedAlreadyLinkedFromNew: number;
};

/**
 * Classifica sugestões catalog-only em novas vs já vinculadas.
 * Não trata “cache ausente”: o caller deve garantir catálogo carregado.
 * Fatores herdados não entram em existingDirectRiskIds.
 */
export function filterCatalogOnlyAiSuggestions(params: {
  incoming: DetailedRisk[];
  incomingAlreadyLinked?: DetailedRisk[];
  catalogIds: Set<string>;
  existingDirectRiskIds: Set<string>;
}): FilterCatalogOnlyAiSuggestionsResult {
  const apiReturnedNewCount = params.incoming.length;
  const apiReturnedAlreadyLinkedCount = (params.incomingAlreadyLinked || [])
    .length;
  let discardedInvalidCatalog = 0;
  let discardedAlreadyLinkedFromNew = 0;

  const accepted: DetailedRisk[] = [];
  const recognizedAlreadyLinked: DetailedRisk[] = [];
  const seenNew = new Set<string>();
  const seenLinked = new Set<string>();

  const pushLinked = (risk: DetailedRisk) => {
    if (!risk?.id || seenLinked.has(risk.id) || seenNew.has(risk.id)) return;
    if (!params.catalogIds.has(risk.id)) {
      discardedInvalidCatalog += 1;
      return;
    }
    seenLinked.add(risk.id);
    recognizedAlreadyLinked.push(risk);
  };

  const pushNew = (risk: DetailedRisk) => {
    if (!risk?.id || seenNew.has(risk.id) || seenLinked.has(risk.id)) return;
    if (!params.catalogIds.has(risk.id)) {
      discardedInvalidCatalog += 1;
      return;
    }
    if (params.existingDirectRiskIds.has(risk.id)) {
      discardedAlreadyLinkedFromNew += 1;
      pushLinked(risk);
      return;
    }
    seenNew.add(risk.id);
    accepted.push(risk);
  };

  for (const risk of params.incomingAlreadyLinked || []) {
    if (!risk?.id) continue;
    if (!params.catalogIds.has(risk.id)) {
      discardedInvalidCatalog += 1;
      continue;
    }
    // API disse “já vinculado”, mas o client não tem o vínculo → trata como novo.
    if (!params.existingDirectRiskIds.has(risk.id)) {
      pushNew(risk);
      continue;
    }
    pushLinked(risk);
  }

  for (const risk of params.incoming) {
    pushNew(risk);
  }

  return {
    accepted,
    recognizedAlreadyLinked,
    apiReturnedNewCount,
    apiReturnedAlreadyLinkedCount,
    discardedInvalidCatalog,
    discardedAlreadyLinkedFromNew,
  };
}
