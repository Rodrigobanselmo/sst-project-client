import { api } from 'core/services/apiClient';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import type {
  AiAnalyzeGseParams,
  AiAnalyzeGseResult,
} from '../homogeneous-group/ai-analyze-gse/service/ai-analyze-gse.types';

type HierarchyTarget = {
  companyId: string;
  workspaceId: string;
  hierarchyId: string;
  hierarchyType: string;
};
const path =
  'v2/companies/:companyId/workspaces/:workspaceId/hierarchies/:hierarchyId/types/:hierarchyType/ai-analyze';
function url(target: HierarchyTarget) {
  return bindUrlParams({ path, pathParams: target });
}
export async function aiAnalyzeHierarchyRisk({
  companyId,
  workspaceId,
  hierarchyId,
  hierarchyType,
  signal,
  ...body
}: HierarchyTarget &
  Pick<
    AiAnalyzeGseParams,
    'scope' | 'riskId' | 'field' | 'selectedFields' | 'userGuidance' | 'signal'
  > & {
    riskFactorDataId: string;
    riskGroupId: string;
  }): Promise<AiAnalyzeGseResult> {
  const response = await api.post(
    url({ companyId, workspaceId, hierarchyId, hierarchyType }),
    body,
    { signal },
  );
  return response.data;
}
export async function transcribeAiAnalyzeHierarchyAudio({
  audio,
  fileName,
  ...target
}: HierarchyTarget & { audio: Blob; fileName?: string }): Promise<{
  text: string;
}> {
  const data = new FormData();
  data.append('audio', audio, fileName || 'recording.webm');
  const response = await api.post(`${url(target)}/transcribe`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
