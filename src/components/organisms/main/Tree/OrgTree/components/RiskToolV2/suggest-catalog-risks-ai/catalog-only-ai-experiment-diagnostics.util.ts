export type CatalogOnlyAiExperimentDiagnostics = {
  model: string;
  selectedImageCount: number | null;
  imagesSentToModelCount: number | null;
  imageFallbackApplied: boolean;
  imageFallbackTextOnly: boolean;
  totalAvailableRisks: number | null;
  rawModelRisksCount: number | null;
  parserAcceptedRisksCount: number | null;
  parserDroppedUnknownIdCount: number | null;
  identifiedAlreadyLinkedCount: number | null;
  newRiskSuggestionsCount: number | null;
};

function asNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean {
  return Boolean(value);
}

/**
 * Extrai o resumo técnico master-only a partir de metadata efêmera da API.
 * Não inclui imagens, URLs, tokens ou prompts.
 */
export function resolveCatalogOnlyAiExperimentDiagnostics(
  metadata: Record<string, unknown> | null | undefined,
): CatalogOnlyAiExperimentDiagnostics | null {
  if (!metadata || typeof metadata !== 'object') return null;

  const model =
    typeof metadata.model === 'string' && metadata.model.trim()
      ? metadata.model.trim()
      : 'padrão do sistema';

  return {
    model,
    selectedImageCount: asNumber(metadata.selectedImageCount),
    imagesSentToModelCount: asNumber(metadata.imagesSentToModelCount),
    imageFallbackApplied: asBoolean(metadata.imageFallbackApplied),
    imageFallbackTextOnly: asBoolean(metadata.imageFallbackTextOnly),
    totalAvailableRisks: asNumber(metadata.totalAvailableRisks),
    rawModelRisksCount: asNumber(metadata.rawModelRisksCount),
    parserAcceptedRisksCount: asNumber(metadata.parserAcceptedRisksCount),
    parserDroppedUnknownIdCount: asNumber(
      metadata.parserDroppedUnknownIdCount,
    ),
    identifiedAlreadyLinkedCount: asNumber(
      metadata.identifiedAlreadyLinkedCount,
    ),
    newRiskSuggestionsCount: asNumber(metadata.newRiskSuggestionsCount),
  };
}

export function formatCatalogOnlyAiExperimentDiagnosticsLines(
  diagnostics: CatalogOnlyAiExperimentDiagnostics,
): string[] {
  const imageFallbackLabel = diagnostics.imageFallbackTextOnly
    ? 'sim (somente texto)'
    : diagnostics.imageFallbackApplied
      ? 'sim (parcial)'
      : 'não';

  return [
    `Modelo efetivo: ${diagnostics.model}`,
    `Fotografias selecionadas: ${diagnostics.selectedImageCount ?? '—'}`,
    `Fotografias enviadas ao modelo: ${diagnostics.imagesSentToModelCount ?? '—'}`,
    `Fallback textual: ${imageFallbackLabel}`,
    `Fatores no catálogo disponível: ${diagnostics.totalAvailableRisks ?? '—'}`,
    `Riscos brutos do modelo: ${diagnostics.rawModelRisksCount ?? '—'}`,
    `Aceitos pelo parser: ${diagnostics.parserAcceptedRisksCount ?? '—'}`,
    `Descartados (ID inválido): ${diagnostics.parserDroppedUnknownIdCount ?? '—'}`,
    `Classificados como já vinculados: ${diagnostics.identifiedAlreadyLinkedCount ?? '—'}`,
    `Classificados como novos: ${diagnostics.newRiskSuggestionsCount ?? '—'}`,
  ];
}
