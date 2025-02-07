import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { DocumentControlRoutes } from '@v2/constants/routes/document-controlroutes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface EditDocumentControlParams {
  documentControlId: number;
  companyId: string;
  name?: string;
  description?: string | null;
  type?: string;
}

export async function editDocumentControl({
  companyId,
  documentControlId,
  ...body
}: EditDocumentControlParams) {
  await api.patch(
    bindUrlParams({
      path: DocumentControlRoutes.DOCUMENT_CONTROL.PATH_ID,
      pathParams: { companyId, documentControlId },
    }),
    { ...body },
  );
}
