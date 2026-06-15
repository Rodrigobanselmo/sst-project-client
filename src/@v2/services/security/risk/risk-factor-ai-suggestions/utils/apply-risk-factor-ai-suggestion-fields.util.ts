import type { RiskFactorAiSuggestionApplyMode } from '@v2/components/molecules/RiskFactorAiSuggestion/RiskFactorAiSuggestionApplyDialog';
import {
  mergeRiskFactorAiSuggestionText,
  type RiskFactorAiSuggestionFormSource,
} from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/build-risk-factor-ai-suggestion-payload.util';

export type RiskFactorAiSuggestionApplyInput = {
  risk: string;
  symptoms: string;
  severity: number | string;
};

export type RiskFactorAiSuggestionApplyResult = {
  risk: string;
  symptoms: string;
  severity: number;
  severityWarning?: string;
};

export const normalizeSuggestedSeverity = (
  severity: unknown,
): number | null => {
  const parsed =
    typeof severity === 'number' ? severity : Number(String(severity).trim());

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }

  return parsed;
};

export function applyRiskFactorAiSuggestionFields(
  current: RiskFactorAiSuggestionFormSource,
  suggestion: RiskFactorAiSuggestionApplyInput,
  mode: RiskFactorAiSuggestionApplyMode,
): RiskFactorAiSuggestionApplyResult {
  const nextRisk =
    mode === 'replace'
      ? suggestion.risk
      : mergeRiskFactorAiSuggestionText(current.risk, suggestion.risk);

  const nextSymptoms =
    mode === 'replace'
      ? suggestion.symptoms
      : mergeRiskFactorAiSuggestionText(current.symptoms, suggestion.symptoms);

  const normalizedSeverity = normalizeSuggestedSeverity(suggestion.severity);
  const currentSeverity = normalizeSuggestedSeverity(current.severity) ?? 0;

  if (normalizedSeverity == null) {
    return {
      risk: nextRisk,
      symptoms: nextSymptoms,
      severity: currentSeverity,
      severityWarning: 'Severidade sugerida inválida — valor atual mantido.',
    };
  }

  return {
    risk: nextRisk,
    symptoms: nextSymptoms,
    severity: normalizedSeverity,
  };
}
