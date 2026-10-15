export type AiSessionAnalysisSummaryInput = {
  hasAnalyzed: boolean;
  /** Novos fatores ainda visíveis (já exclui descartados). */
  pendingNewRiskCount: number;
  /** Reviews com melhorias ainda pendentes (já exclui aceitas/descartadas). */
  pendingReviewCount: number;
  acceptedNewRiskCount: number;
  acceptedModularCount: number;
  discardedNewRiskCount: number;
  discardedModularCount: number;
};

export type AiSessionAnalysisSummary = AiSessionAnalysisSummaryInput & {
  hasRecoverableAnalysis: boolean;
};

export function hasRecoverableAiSessionAnalysis(
  input: AiSessionAnalysisSummaryInput,
): boolean {
  return (
    input.hasAnalyzed ||
    input.pendingNewRiskCount > 0 ||
    input.pendingReviewCount > 0 ||
    input.acceptedNewRiskCount > 0 ||
    input.acceptedModularCount > 0 ||
    input.discardedNewRiskCount > 0 ||
    input.discardedModularCount > 0
  );
}

/**
 * Resumo local da sessão operacional.
 * Contagens devem chegar já filtradas (pendente ≠ aceita/descartada).
 * Não dispara IA e não altera inventário/PGR.
 */
export function summarizeAiSessionAnalysis(
  input: AiSessionAnalysisSummaryInput,
): AiSessionAnalysisSummary {
  return {
    ...input,
    hasRecoverableAnalysis: hasRecoverableAiSessionAnalysis(input),
  };
}
