import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import {
  AiCharacterizationAssistParams,
  AiCharacterizationAssistResult,
} from './ai-characterization-assist.types';

export async function aiCharacterizationAssist({
  companyId,
  workspaceId,
  characterizationId,
  ...body
}: AiCharacterizationAssistParams): Promise<AiCharacterizationAssistResult> {
  const response = await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.AI_CHARACTERIZATION_ASSIST,
      pathParams: { companyId, workspaceId, characterizationId },
    }),
    body,
  );

  return response.data;
}
