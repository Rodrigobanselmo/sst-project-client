import { api } from 'core/services/apiClient';
import type {
  ExamRiskReviewPatch,
  ExamRiskReviewResponse,
  ExamRiskReviewScope,
} from './company-exam-risk-parameter-review.types';

const route = ({ companyId, riskId }: ExamRiskReviewScope) =>
  `/v2/companies/${encodeURIComponent(companyId)}/exam-risk-parameter-reviews/${encodeURIComponent(riskId)}`;

export const examRiskReviewQueryKeys = {
  risk: ({ companyId, riskId }: ExamRiskReviewScope) =>
    ['exam-risk-parameter-reviews', companyId, riskId] as const,
};

export async function fetchExamRiskParameterReviews(
  scope: ExamRiskReviewScope,
): Promise<ExamRiskReviewResponse> {
  return (
    await api.get<ExamRiskReviewResponse>(route(scope), {
      params: { workspaceId: scope.workspaceId },
    })
  ).data;
}

export async function updateExamRiskParameterReview(
  scope: ExamRiskReviewScope,
  patch: ExamRiskReviewPatch,
): Promise<void> {
  await api.patch(route(scope), { ...patch, workspaceId: scope.workspaceId });
}
