import { api } from 'core/services/apiClient';
export type ContextualLibraryDeleteParams = {
  companyId: string;
  workspaceId: string;
  riskId: string;
  ruleId: string;
  ruleExamId: string;
  examId: number;
  expectedRuleUpdatedAt: string;
  expectedItemUpdatedAt: string;
};
export type LibraryDeletionEligibility = { eligible: boolean; reason: string };
const route = (p: ContextualLibraryDeleteParams) =>
  `/v2/companies/${encodeURIComponent(p.companyId)}/risks/${encodeURIComponent(p.riskId)}/library-recommendations/${encodeURIComponent(p.ruleId)}/exams/${encodeURIComponent(p.ruleExamId)}`;
const query = ({
  workspaceId,
  examId,
  expectedRuleUpdatedAt,
  expectedItemUpdatedAt,
}: ContextualLibraryDeleteParams) => ({
  workspaceId,
  examId,
  expectedRuleUpdatedAt,
  expectedItemUpdatedAt,
});
export async function fetchLibraryDeletionEligibility(
  p: ContextualLibraryDeleteParams,
): Promise<LibraryDeletionEligibility> {
  return (
    await api.get(`${route(p)}/deletion-eligibility`, { params: query(p) })
  ).data;
}
export async function deleteContextualLibraryRecommendation(
  p: ContextualLibraryDeleteParams,
): Promise<{ deleted: boolean }> {
  return (await api.delete(route(p), { params: query(p) })).data;
}
