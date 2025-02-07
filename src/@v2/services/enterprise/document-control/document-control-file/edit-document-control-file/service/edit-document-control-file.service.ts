import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { DocumentControlRoutes } from '@v2/constants/routes/document-controlroutes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface EditDocumentControlFileParams {
  documentControlFileId: number;
  companyId: string;
  fileId: string;
  name?: string;
  endDate?: Date;
  startDate?: Date;
  description?: string;
}

export async function editDocumentControlFile({
  companyId,
  documentControlFileId,
  ...body
}: EditDocumentControlFileParams) {
  await api.patch(
    bindUrlParams({
      path: DocumentControlRoutes.DOCUMENT_CONTROL_FILE.PATH_ID,
      pathParams: { companyId, documentControlFileId },
    }),
    { ...body },
  );
}
