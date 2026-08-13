import type { DetailedRisk } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

export function resolveCurrentAiRisk(
  modifiedRisks: Record<string, DetailedRisk>,
  visibleSuggestions: DetailedRisk[],
  riskId: string,
): DetailedRisk | undefined {
  return modifiedRisks[riskId] || visibleSuggestions.find((risk) => risk.id === riskId);
}

export function applyAiRiskSuggestionPatch(
  prev: Record<string, DetailedRisk>,
  visibleSuggestions: DetailedRisk[],
  riskId: string,
  patch: (risk: DetailedRisk) => DetailedRisk,
): Record<string, DetailedRisk> {
  const currentRisk = resolveCurrentAiRisk(prev, visibleSuggestions, riskId);
  if (!currentRisk) return prev;

  return {
    ...prev,
    [riskId]: patch(currentRisk),
  };
}

export function removeAiRiskMeasureAt(measures: string[], index: number): string[] {
  const next = [...measures];
  next.splice(index, 1);
  return next;
}

export function replaceAiRiskMeasureAt(
  measures: string[],
  index: number,
  value: string,
): string[] {
  const next = [...measures];
  next[index] = value;
  return next;
}
