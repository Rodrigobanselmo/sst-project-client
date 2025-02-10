import { DocumentControlRoutes } from '@v2/constants/routes/document-controlroutes';
import {
  ISystemFile,
  SystemFile,
} from '@v2/models/@shared/models/system-file.model';
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

  const systemFile = await api.post<ISystemFile>(
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

  return new SystemFile(systemFile.data);
}
