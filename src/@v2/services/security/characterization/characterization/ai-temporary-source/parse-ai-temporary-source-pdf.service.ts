import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { AiTemporaryPdfParseResult } from './ai-temporary-document-source.types';

export type ParseAiTemporarySourcePdfParams = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  file: File;
};

export async function parseAiTemporarySourcePdf({
  companyId,
  workspaceId,
  characterizationId,
  file,
}: ParseAiTemporarySourcePdfParams): Promise<AiTemporaryPdfParseResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<AiTemporaryPdfParseResult>(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.AI_TEMPORARY_SOURCE_PARSE_PDF,
      pathParams: { companyId, workspaceId, characterizationId },
    }),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return response.data;
}
