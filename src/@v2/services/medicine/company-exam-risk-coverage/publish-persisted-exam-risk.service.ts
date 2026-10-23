import { api } from 'core/services/apiClient';
export type PublishPersistedExamRiskResult = {
  action: 'created' | 'alreadyExists' | 'skipped';
  reason: string;
  ruleId?: string;
};
export async function publishPersistedExamRisk({
  companyId,
  workspaceId,
  linkId,
}: {
  companyId: string;
  workspaceId: string;
  linkId: number;
}) {
  const { data } = await api.post<PublishPersistedExamRiskResult>(
    `/v2/companies/${companyId}/exam-risk-links/${linkId}/publish-library`,
    undefined,
    { params: { workspaceId } },
  );
  return data;
}
