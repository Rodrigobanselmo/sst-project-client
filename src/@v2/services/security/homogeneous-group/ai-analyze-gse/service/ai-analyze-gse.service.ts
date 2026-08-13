import { HomogeneousGroupRoutes } from '@v2/constants/routes/homogeneous-group.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { AiAnalyzeGseParams, AiAnalyzeGseResult } from './ai-analyze-gse.types';

export async function aiAnalyzeGse({
  companyId,
  workspaceId,
  gseId,
  signal,
  ...body
}: AiAnalyzeGseParams): Promise<AiAnalyzeGseResult> {
  const response = await api.post(
    bindUrlParams({
      path: HomogeneousGroupRoutes.AI_ANALYZE,
      pathParams: { companyId, workspaceId, gseId },
    }),
    body,
    { signal },
  );

  return response.data;
}
