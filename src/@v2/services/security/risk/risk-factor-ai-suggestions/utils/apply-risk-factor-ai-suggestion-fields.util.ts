import type { RiskFactorAiSuggestionApplyMode } from '@v2/components/molecules/RiskFactorAiSuggestion/RiskFactorAiSuggestionApplyDialog';
import type { RiskFactorAiSuggestionFormSource } from '@v2/services/security/risk/risk-factor-ai-suggestions/utils/build-risk-factor-ai-suggestion-payload.util';

export type RiskFactorAiSuggestionApplyInput = {
  risk: string;
  symptoms: string;
  affectedRegion: string;
  absorptionRoutes: string;
  severity: number | string;
};

export type RiskFactorAiSuggestionApplyResult = {
  risk: string;
  symptoms: string;
  affectedRegion: string;
  absorptionRoutes: string;
  severity: number;
  severityWarning?: string;
};

const hasText = (value?: string | null) => Boolean(value?.trim());

const keepExistingText = (current?: string | null) => current ?? '';

const incomingText = (suggestion?: string | null) => suggestion?.trim() ?? '';

export const normalizeSuggestedSeverity = (
  severity: unknown,
): number | null => {
  const parsed =
    typeof severity === 'number' ? severity : Number(String(severity ?? '').trim());

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }

  return parsed;
};

const applyTextField = (
  current: string | undefined,
  suggestion: string,
  mode: RiskFactorAiSuggestionApplyMode,
) => {
  if (mode === 'fill-empty' && hasText(current)) {
    return keepExistingText(current);
  }

  return incomingText(suggestion);
};

export function applyRiskFactorAiSuggestionFields(
  current: RiskFactorAiSuggestionFormSource,
  suggestion: RiskFactorAiSuggestionApplyInput,
  mode: RiskFactorAiSuggestionApplyMode,
): RiskFactorAiSuggestionApplyResult {
  const risk = applyTextField(current.risk, suggestion.risk, mode);
  const symptoms = applyTextField(current.symptoms, suggestion.symptoms, mode);
  const affectedRegion = applyTextField(
    current.affectedRegion,
    suggestion.affectedRegion,
    mode,
  );
  const absorptionRoutes = applyTextField(
    current.absorptionRoutes,
    suggestion.absorptionRoutes,
    mode,
  );

  const normalizedSeverity = normalizeSuggestedSeverity(suggestion.severity);
  const currentSeverity = normalizeSuggestedSeverity(current.severity);
  const preservedSeverity = currentSeverity ?? 0;

  if (mode === 'fill-empty' && currentSeverity != null) {
    return {
      risk,
      symptoms,
      affectedRegion,
      absorptionRoutes,
      severity: currentSeverity,
    };
  }

  if (normalizedSeverity == null) {
    return {
      risk,
      symptoms,
      affectedRegion,
      absorptionRoutes,
      severity: preservedSeverity,
      severityWarning: 'Severidade sugerida inválida — valor atual mantido.',
    };
  }

  return {
    risk,
    symptoms,
    affectedRegion,
    absorptionRoutes,
    severity: normalizedSeverity,
  };
}
