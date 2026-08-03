import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import {
  AiCharacterizationAssistParams,
  AiCharacterizationAssistResult,
} from './ai-characterization-assist.types';
import {
  AiCharacterizationAssistArchitecturePreviewParams,
  AiCharacterizationAssistArchitecturePreviewResult,
} from './ai-characterization-assist-architecture-preview.types';

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

export async function aiCharacterizationAssistArchitecturePreview({
  companyId,
  workspaceId,
  characterizationId,
  ...body
}: AiCharacterizationAssistArchitecturePreviewParams): Promise<AiCharacterizationAssistArchitecturePreviewResult> {
  const response = await api.post<AiCharacterizationAssistArchitecturePreviewResult>(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION
        .AI_CHARACTERIZATION_ASSIST_ARCHITECTURE_PREVIEW,
      pathParams: { companyId, workspaceId, characterizationId },
    }),
    body,
  );

  return response.data;
}
