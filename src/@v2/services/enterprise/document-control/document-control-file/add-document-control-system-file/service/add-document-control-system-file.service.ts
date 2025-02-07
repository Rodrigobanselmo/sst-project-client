import { DocumentControlRoutes } from '@v2/constants/routes/document-controlroutes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface AddDocumentControlSystemFileParams {
  companyId: string;
  file: File;
}

export async function addDocumentControlSystemFile({
  companyId,
  file,
}: AddDocumentControlSystemFileParams) {
  const formData = new FormData();
  formData.append('file', file);

  await api.post(
    bindUrlParams({
      path: DocumentControlRoutes.FILE.PATH,
      pathParams: { companyId },
    }),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}
