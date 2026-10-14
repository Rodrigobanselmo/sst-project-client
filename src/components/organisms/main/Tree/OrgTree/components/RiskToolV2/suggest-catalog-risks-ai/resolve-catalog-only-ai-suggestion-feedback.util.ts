import type { FilterCatalogOnlyAiSuggestionsResult } from './filter-catalog-only-ai-suggestions.util';

export type CatalogOnlyAiSuggestionFeedback = {
  variant: 'info' | 'warning' | 'success';
  message: string;
};

export type CatalogOnlyImageAnalysisMeta = {
  selectedImageCount?: number;
  imagesSentToModelCount?: number;
  imageFallbackApplied?: boolean;
  imageFallbackTextOnly?: boolean;
  selectedImagesNotProcessedCount?: number;
};

/**
 * Mensagens pós-análise (catálogo já carregado com sucesso).
 * Falha de catálogo é tratada antes, fora desta função.
 */
export function resolveCatalogOnlyAiSuggestionFeedback(
  result: FilterCatalogOnlyAiSuggestionsResult,
  imageMeta?: CatalogOnlyImageAnalysisMeta | null,
): CatalogOnlyAiSuggestionFeedback | null {
  const recognizedCount = result.recognizedAlreadyLinked.length;
  const newCount = result.accepted.length;
  const apiTotal =
    result.apiReturnedNewCount + result.apiReturnedAlreadyLinkedCount;

  const imageNote =
    imageMeta?.imageFallbackApplied &&
    (imageMeta.imageFallbackTextOnly ||
      (imageMeta.selectedImagesNotProcessedCount || 0) > 0)
      ? imageMeta.imageFallbackTextOnly
        ? ' As fotografias selecionadas não puderam ser processadas; a análise foi apenas textual.'
        : ` Parte das fotografias não foi processada (${imageMeta.selectedImagesNotProcessedCount}).`
      : '';

  if (apiTotal === 0) {
    return {
      variant: 'info',
      message:
        `Análise concluída sem fatores de risco pertinentes identificados nesta rodada. Isso não implica que os riscos já cadastrados estejam incorretos.${imageNote}`,
    };
  }

  if (newCount === 0 && recognizedCount === 0) {
    return {
      variant: 'warning',
      message: `Análise concluída, mas nenhuma sugestão ficou disponível (fora do catálogo).${imageNote}`,
    };
  }

  if (result.discardedInvalidCatalog > 0) {
    return {
      variant: 'info',
      message: `Análise concluída: ${newCount} novo(s) e ${recognizedCount} já vinculado(s). ${result.discardedInvalidCatalog} fora do catálogo foram descartados.${imageNote}`,
    };
  }

  if (newCount > 0 && recognizedCount > 0) {
    return {
      variant: 'success',
      message: `Análise concluída: ${newCount} nova(s) oportunidade(s) e ${recognizedCount} fator(es) já vinculado(s) reconhecido(s).${imageNote}`,
    };
  }

  if (newCount === 0 && recognizedCount > 0) {
    return {
      variant: 'info',
      message: `Análise concluída sem novos fatores. ${recognizedCount} fator(es) pertinente(s) já vinculado(s) foram reconhecidos.${imageNote}`,
    };
  }

  if (newCount > 0) {
    return {
      variant: 'success',
      message: `Análise concluída com ${newCount} nova(s) oportunidade(s) de inclusão.${imageNote}`,
    };
  }

  return imageNote
    ? { variant: 'warning', message: imageNote.trim() }
    : null;
}
