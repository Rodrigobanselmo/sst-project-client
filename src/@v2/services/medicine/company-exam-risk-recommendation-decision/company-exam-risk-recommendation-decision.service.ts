import { api } from 'core/services/apiClient';
import type { ICompanyExamRiskCoverageItem as Item } from '../company-exam-risk-coverage/company-exam-risk-coverage.types';

import type {
  RecommendationDecisionScope,
  RecommendationDecisionPatch,
} from './company-exam-risk-recommendation-decision.types';
const route = (scope: RecommendationDecisionScope) => {
  if (!scope.companyId || !scope.workspaceId || !scope.riskId)
    throw new Error('Selecione um estabelecimento para registrar a decisão.');
  return `/v2/companies/${encodeURIComponent(scope.companyId)}/exam-risk-recommendation-decisions/${encodeURIComponent(scope.riskId)}`;
};
export async function fetchExamRiskRecommendationDecisions(
  scope: RecommendationDecisionScope,
): Promise<Item> {
  return (
    await api.get<Item>(route(scope), {
      params: { workspaceId: scope.workspaceId },
    })
  ).data;
}
export async function updateExamRiskRecommendationDecision(
  scope: RecommendationDecisionScope,
  patch: RecommendationDecisionPatch,
): Promise<Item> {
  return (
    await api.patch<Item>(route(scope), {
      ...patch,
      workspaceId: scope.workspaceId,
    })
  ).data;
}
