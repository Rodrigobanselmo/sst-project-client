import { DocumentControlRoutes } from '@v2/constants/routes/document-controlroutes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface AddDocumentControlParams {
  companyId: string;
  workspaceId: string;
  name: string;
  description?: string;
  type: string;
  file?: {
    fileId: string;
    name?: string;
    endDate?: Date;
    startDate?: Date;
  };
}

export async function addDocumentControl({
  companyId,
  workspaceId,
  ...body
}: AddDocumentControlParams) {
  await api.post(
    bindUrlParams({
      path: DocumentControlRoutes.DOCUMENT_CONTROL.PATH,
      pathParams: { companyId, workspaceId },
    }),
    body,
  );
}
