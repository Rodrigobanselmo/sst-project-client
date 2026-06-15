import { api } from 'core/services/apiClient';

import { RiskFactorRoutes } from '@v2/constants/routes/risk-factor.routes';

import {
  RiskFactorAiSuggestionPayload,
  RiskFactorAiSuggestionResult,
} from './risk-factor-ai-suggestions.types';

export async function requestRiskFactorAiSuggestions(
  payload: RiskFactorAiSuggestionPayload,
): Promise<RiskFactorAiSuggestionResult> {
  const response = await api.post<RiskFactorAiSuggestionResult>(
    RiskFactorRoutes.RISK_FACTOR.AI_SUGGESTIONS,
    payload,
  );

  return response.data;
}
