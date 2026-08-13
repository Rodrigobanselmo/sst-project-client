import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';

export type TranscribeAiAnalyzeCharacterizationAudioResult = {
  text: string;
};

export async function transcribeAiAnalyzeCharacterizationAudio(params: {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  audio: Blob;
  fileName?: string;
}): Promise<TranscribeAiAnalyzeCharacterizationAudioResult> {
  const formData = new FormData();
  formData.append('audio', params.audio, params.fileName ?? 'recording.webm');

  const response = await api.post<TranscribeAiAnalyzeCharacterizationAudioResult>(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.AI_ANALYZE_TRANSCRIBE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        characterizationId: params.characterizationId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return response.data;
}
