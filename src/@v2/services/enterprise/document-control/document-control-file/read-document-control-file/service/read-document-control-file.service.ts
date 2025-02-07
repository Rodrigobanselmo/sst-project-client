import { DocumentControlRoutes } from '@v2/constants/routes/document-controlroutes';
import {
  DocumentControlFileReadModel,
  IDocumentControlFileReadModel,
} from '@v2/models/enterprise/models/document-control/document-control-file/document-control-file-read.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface ReadDocumentControlFileParams {
  companyId: string;
  documentControlFileId: number;
}

export async function readDocumentControlFile({
  documentControlFileId,
  companyId,
}: ReadDocumentControlFileParams) {
  const response = await api.get<IDocumentControlFileReadModel>(
    bindUrlParams({
      path: DocumentControlRoutes.DOCUMENT_CONTROL_FILE.PATH_ID,
      pathParams: { companyId, documentControlFileId },
    }),
  );

  return new DocumentControlFileReadModel(response.data);
}
