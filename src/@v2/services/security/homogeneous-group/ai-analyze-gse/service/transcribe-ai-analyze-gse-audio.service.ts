import { HomogeneousGroupRoutes } from '@v2/constants/routes/homogeneous-group.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export type TranscribeAiAnalyzeGseAudioResult = {
  text: string;
};

export async function transcribeAiAnalyzeGseAudio(params: {
  companyId: string;
  workspaceId: string;
  gseId: string;
  audio: Blob;
  fileName?: string;
}): Promise<TranscribeAiAnalyzeGseAudioResult> {
  const formData = new FormData();
  formData.append('audio', params.audio, params.fileName ?? 'recording.webm');

  const response = await api.post<TranscribeAiAnalyzeGseAudioResult>(
    bindUrlParams({
      path: HomogeneousGroupRoutes.AI_ANALYZE_TRANSCRIBE,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        gseId: params.gseId,
      },
    }),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );

  return response.data;
}
