import { DocumentControlRoutes } from '@v2/constants/routes/document-controlroutes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface AddDocumentControlFileParams {
  companyId: string;
  documentControlId: number;
  fileId: string;
  name?: string;
  endDate?: Date;
  startDate?: Date;
  description?: string;
}

export async function addDocumentControlFile({
  companyId,
  documentControlId,
  ...body
}: AddDocumentControlFileParams) {
  await api.post(
    bindUrlParams({
      path: DocumentControlRoutes.DOCUMENT_CONTROL_FILE.PATH,
      pathParams: { companyId, documentControlId },
    }),
    body,
  );
}
