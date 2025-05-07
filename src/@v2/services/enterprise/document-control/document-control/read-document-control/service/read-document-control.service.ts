import { DocumentControlRoutes } from '@v2/constants/routes/document-control.routes';
import {
  DocumentControlReadModel,
  IDocumentControlReadModel,
} from '@v2/models/enterprise/models/document-control/document-control/document-control-read.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface ReadDocumentControlParams {
  companyId: string;
  documentControlId: number;
}

export async function readDocumentControl({
  documentControlId,
  companyId,
}: ReadDocumentControlParams) {
  const response = await api.get<IDocumentControlReadModel>(
    bindUrlParams({
      path: DocumentControlRoutes.DOCUMENT_CONTROL.PATH_ID,
      pathParams: { companyId, documentControlId },
    }),
  );

  return new DocumentControlReadModel(response.data);
}
