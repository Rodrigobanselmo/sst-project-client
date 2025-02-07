import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { DocumentControlRoutes } from '@v2/constants/routes/document-controlroutes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface DeleteDocumentControlFileParams {
  documentControlFileId: number;
  companyId: string;
}

export async function deleteDocumentControlFile({
  companyId,
  documentControlFileId,
}: DeleteDocumentControlFileParams) {
  await api.delete(
    bindUrlParams({
      path: DocumentControlRoutes.DOCUMENT_CONTROL_FILE.PATH_ID,
      pathParams: { companyId, documentControlFileId },
    }),
  );
}
