import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import type {
  ApplyCharacterizationAiAssistTraceParams,
  BrowseCharacterizationAiAssistTracesParams,
  CharacterizationAiAssistTraceItem,
  MarkSavedCharacterizationAiAssistTraceParams,
} from './ai-characterization-assist-traceability.types';

export async function browseCharacterizationAiAssistTraces(
  params: BrowseCharacterizationAiAssistTracesParams,
): Promise<CharacterizationAiAssistTraceItem[]> {
  const response = await api.get(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.AI_CHARACTERIZATION_ASSIST_TRACES,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        characterizationId: params.characterizationId,
      },
    }),
  );

  return response.data;
}

export async function applyCharacterizationAiAssistTrace({
  companyId,
  workspaceId,
  characterizationId,
  traceId,
  ...body
}: ApplyCharacterizationAiAssistTraceParams) {
  const response = await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION
        .AI_CHARACTERIZATION_ASSIST_TRACE_APPLY,
      pathParams: { companyId, workspaceId, characterizationId, traceId },
    }),
    body,
  );

  return response.data;
}

export async function markSavedCharacterizationAiAssistTrace({
  companyId,
  workspaceId,
  characterizationId,
  traceId,
}: MarkSavedCharacterizationAiAssistTraceParams) {
  const response = await api.patch(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION
        .AI_CHARACTERIZATION_ASSIST_TRACE_MARK_SAVED,
      pathParams: { companyId, workspaceId, characterizationId, traceId },
    }),
  );

  return response.data;
}
