import type { HoMethodRiskMatchConfidence } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import {
  buildHoMethodCreateRiskPrefill,
  type HoMethodCreateRiskPrefillInput,
} from './ho-method-create-risk-prefill.util';

export type {
  HoMethodCreateRiskPrefillInput,
  HoMethodCreateRiskAgentSource,
  HoMethodCreateRiskParseContext,
} from './ho-method-create-risk-prefill.util';
export {
  buildHoMethodCreateRiskPrefill,
  normalizeDecimalForPtBr,
  normalizeLimitExpression,
  normalizeOccupationalLimitUnit,
  parseOccupationalLimitExpression,
  resolveHoMethodRiskPropagationMeans,
  type HoMethodCreateRiskMethodContext,
  type HoMethodCreateRiskSmartSuggestions,
} from './ho-method-create-risk-prefill.util';
export {
  buildRuleBasedHoMethodCreateRiskSmartSuggestions,
  buildManualHoMethodCreateRiskSmartSuggestions,
  resolveHoMethodCreateRiskSmartSuggestions,
  hoMethodCreateRiskAiSuggestionProvider,
  type HoMethodCreateRiskAiSuggestionProvider,
  type HoMethodCreateRiskSuggestionSource,
  type HoMethodCreateRiskSmartSuggestionInput,
} from './ho-method-create-risk-smart-suggestions.util';

export function buildHoMethodCreateRiskInitialData(
  params: HoMethodCreateRiskPrefillInput,
) {
  return buildHoMethodCreateRiskPrefill(params);
}

export function buildHoMethodAgentSearchTerm(
  agent: import('./ho-method-create-risk-prefill.util').HoMethodCreateRiskAgentSource,
): string {
  return agent.cas?.trim() || agent.substanceName.trim() || agent.synonyms[0]?.trim() || '';
}

export function mergeRiskFactorOptions(
  searchResults: Array<{ id: string }>,
  candidates: Array<{ id: string }>,
) {
  const map = new Map<string, { id: string }>();
  candidates.forEach((item) => map.set(item.id, item));
  searchResults.forEach((item) => map.set(item.id, item));
  return Array.from(map.values());
}

export const HO_METHOD_MATCH_CONFIDENCE_LABELS: Record<
  HoMethodRiskMatchConfidence,
  string
> = {
  high: 'Correspondência confirmada',
  low: 'Correspondência incerta — revise ou crie o fator de risco',
  none: 'Não encontrado — vincule ou crie o fator de risco',
};

export function shouldOfferCreateRiskAction(params: {
  found: boolean;
  matchConfidence?: HoMethodRiskMatchConfidence;
}) {
  if (params.found && params.matchConfidence === 'high') return false;
  return true;
}
