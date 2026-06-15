import { SystemAiPromptKeyEnum } from '@v2/constants/enums/system-ai-prompt-key.enum';
import { RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT } from '@v2/constants/risk-factor-chemical-ai-suggestions-default-prompt.constant';
import {
  RISK_FACTOR_ACCIDENT_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_BIOLOGICAL_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_ERGONOMIC_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_OTHER_AI_SUGGESTIONS_DEFAULT_PROMPT,
  RISK_FACTOR_PHYSICAL_AI_SUGGESTIONS_DEFAULT_PROMPT,
} from '@v2/constants/risk-factor-ai-suggestions-default-prompts.constant';

export const AI_SUGGESTION_SUPPORTED_RISK_TYPES = [
  'QUI',
  'FIS',
  'BIO',
  'ERG',
  'ACI',
  'OUTROS',
] as const;

export const normalizeRiskFactorType = (type?: string): string =>
  (type ?? 'QUI').trim().toUpperCase();

export const isAiSuggestionSupportedRiskType = (type?: string): boolean =>
  AI_SUGGESTION_SUPPORTED_RISK_TYPES.includes(
    normalizeRiskFactorType(type) as (typeof AI_SUGGESTION_SUPPORTED_RISK_TYPES)[number],
  );

export const resolveRiskFactorAiSuggestionPromptKey = (
  type?: string,
): SystemAiPromptKeyEnum => {
  switch (normalizeRiskFactorType(type)) {
    case 'FIS':
      return SystemAiPromptKeyEnum.RISK_FACTOR_PHYSICAL_AI_SUGGESTIONS;
    case 'BIO':
      return SystemAiPromptKeyEnum.RISK_FACTOR_BIOLOGICAL_AI_SUGGESTIONS;
    case 'ERG':
      return SystemAiPromptKeyEnum.RISK_FACTOR_ERGONOMIC_AI_SUGGESTIONS;
    case 'ACI':
      return SystemAiPromptKeyEnum.RISK_FACTOR_ACCIDENT_AI_SUGGESTIONS;
    case 'OUTROS':
      return SystemAiPromptKeyEnum.RISK_FACTOR_OTHER_AI_SUGGESTIONS;
    case 'QUI':
    default:
      return SystemAiPromptKeyEnum.RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS;
  }
};

export const getRiskFactorAiSuggestionsDefaultPromptByType = (
  type?: string,
): string => {
  switch (normalizeRiskFactorType(type)) {
    case 'FIS':
      return RISK_FACTOR_PHYSICAL_AI_SUGGESTIONS_DEFAULT_PROMPT;
    case 'BIO':
      return RISK_FACTOR_BIOLOGICAL_AI_SUGGESTIONS_DEFAULT_PROMPT;
    case 'ERG':
      return RISK_FACTOR_ERGONOMIC_AI_SUGGESTIONS_DEFAULT_PROMPT;
    case 'ACI':
      return RISK_FACTOR_ACCIDENT_AI_SUGGESTIONS_DEFAULT_PROMPT;
    case 'OUTROS':
      return RISK_FACTOR_OTHER_AI_SUGGESTIONS_DEFAULT_PROMPT;
    case 'QUI':
    default:
      return RISK_FACTOR_CHEMICAL_AI_SUGGESTIONS_DEFAULT_PROMPT;
  }
};

export const RISK_FACTOR_AI_SUGGESTION_TYPE_LABELS: Record<string, string> = {
  QUI: 'Químico',
  FIS: 'Físico',
  BIO: 'Biológico',
  ERG: 'Ergonômico',
  ACI: 'Acidente',
  OUTROS: 'Outros',
};

export const getRiskFactorAiSuggestionTypeLabel = (type?: string): string =>
  RISK_FACTOR_AI_SUGGESTION_TYPE_LABELS[normalizeRiskFactorType(type)] ?? 'de Risco';
