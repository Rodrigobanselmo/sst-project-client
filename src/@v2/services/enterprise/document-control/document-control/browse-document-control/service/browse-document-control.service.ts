import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import {
  DocumentControlBrowseModel,
  IDocumentControlBrowseModel,
} from '@v2/models/enterprise/models/document-control/document-control/document-control-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { simulateAwait } from 'core/utils/helpers/simulateAwait';
import { BrowseDocumentControlParams } from './browse-document-control.types';
import { DocumentControlRoutes } from '@v2/constants/routes/document-control.routes';

export async function browseDocumentControl({
  workspaceId,
  companyId,
  filters,
  ...query
}: BrowseDocumentControlParams) {
  const response = await api.get<IDocumentControlBrowseModel>(
    bindUrlParams({
      path: DocumentControlRoutes.DOCUMENT_CONTROL.PATH,
      pathParams: { companyId, workspaceId },
      queryParams: { ...query, ...filters },
    }),
  );

  return new DocumentControlBrowseModel(response.data);
}
