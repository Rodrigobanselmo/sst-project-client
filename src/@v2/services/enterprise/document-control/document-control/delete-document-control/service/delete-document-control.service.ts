import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { DocumentControlRoutes } from '@v2/constants/routes/document-control.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface DeleteDocumentControlParams {
  documentControlId: number;
  companyId: string;
}

export async function deleteDocumentControl({
  companyId,
  documentControlId,
}: DeleteDocumentControlParams) {
  await api.delete(
    bindUrlParams({
      path: DocumentControlRoutes.DOCUMENT_CONTROL.PATH_ID,
      pathParams: { companyId, documentControlId },
    }),
  );
}
