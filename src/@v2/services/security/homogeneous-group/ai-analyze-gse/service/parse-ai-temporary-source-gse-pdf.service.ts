import { HomogeneousGroupRoutes } from '@v2/constants/routes/homogeneous-group.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { AiTemporaryPdfParseResult } from '@v2/services/security/characterization/characterization/ai-temporary-source/ai-temporary-document-source.types';

export type ParseAiTemporarySourceGsePdfParams = {
  companyId: string;
  workspaceId: string;
  gseId: string;
  file: File;
};

export async function parseAiTemporarySourceGsePdf({
  companyId,
  workspaceId,
  gseId,
  file,
}: ParseAiTemporarySourceGsePdfParams): Promise<AiTemporaryPdfParseResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<AiTemporaryPdfParseResult>(
    bindUrlParams({
      path: HomogeneousGroupRoutes.AI_TEMPORARY_SOURCE_PARSE_PDF,
      pathParams: { companyId, workspaceId, gseId },
    }),
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );

  return response.data;
}
