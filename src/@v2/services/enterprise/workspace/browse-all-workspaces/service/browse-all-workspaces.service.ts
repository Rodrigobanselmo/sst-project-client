import { CompanyRoutes } from '@v2/constants/routes/company.routes';
import {
  IWorkspaceBrowseModel,
  WorkspaceBrowseModel,
} from '@v2/models/enterprise/models/workspace/workspace-browse-all.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseAllWorkspacesParams } from './browse-all-workspaces.types';

export async function browseAllWorkspaces({
  orderBy,
  companyId,
  filters = {},
}: BrowseAllWorkspacesParams) {
  const response = await api.get<IWorkspaceBrowseModel>(
    bindUrlParams({
      path: CompanyRoutes.WORKSPACE.BROWSE_ALL,
      pathParams: { companyId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...filters,
      },
    }),
  );

  return new WorkspaceBrowseModel(response.data);
}
