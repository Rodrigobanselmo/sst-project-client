import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  AiAnalyzeCharacterizationParams,
  Result,
} from './ai-analyze-characterization.types';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';

export async function aiAnalyzeCharacterization({
  companyId,
  workspaceId,
  characterizationId,
  ...body
}: AiAnalyzeCharacterizationParams): Promise<Result> {
  const response = await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.AI_ANALYZE,
      pathParams: { companyId, workspaceId, characterizationId },
    }),
    body,
  );

  return response.data;
}
