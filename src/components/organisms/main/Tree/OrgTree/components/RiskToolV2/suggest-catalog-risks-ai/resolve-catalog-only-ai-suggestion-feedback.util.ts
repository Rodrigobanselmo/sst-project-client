import type { FilterCatalogOnlyAiSuggestionsResult } from './filter-catalog-only-ai-suggestions.util';

export type CatalogOnlyAiSuggestionFeedback = {
  variant: 'info' | 'warning';
  message: string;
};

/**
 * Mensagens pós-análise (catálogo já carregado com sucesso).
 * Falha de catálogo é tratada antes, fora desta função.
 */
export function resolveCatalogOnlyAiSuggestionFeedback(
  result: FilterCatalogOnlyAiSuggestionsResult,
): CatalogOnlyAiSuggestionFeedback | null {
  if (result.apiReturnedCount === 0) {
    return {
      variant: 'info',
      message:
        'A análise não retornou sugestões de fatores para este contexto.',
    };
  }

  const discarded =
    result.discardedInvalidCatalog + result.discardedAlreadyLinked;

  if (result.accepted.length === 0) {
    return {
      variant: 'warning',
      message:
        'Nenhuma das sugestões retornadas está disponível para vincular (fora do catálogo ou já vinculadas).',
    };
  }

  if (discarded > 0) {
    return {
      variant: 'info',
      message: `${result.accepted.length} sugestão(ões) disponível(is). ${discarded} foram descartadas (fora do catálogo ou já vinculadas).`,
    };
  }

  return null;
}
