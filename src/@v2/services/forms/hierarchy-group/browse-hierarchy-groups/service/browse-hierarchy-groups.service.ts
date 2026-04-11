import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface HierarchyGroupResult {
  id: string;
  name: string;
  hierarchyIds: string[];
}

export interface BrowseHierarchyGroupsParams {
  companyId: string;
  applicationId: string;
}

export async function browseHierarchyGroups({
  companyId,
  applicationId,
}: BrowseHierarchyGroupsParams): Promise<HierarchyGroupResult[]> {
  const response = await api.get<HierarchyGroupResult[]>(
    bindUrlParams({
      path: FormRoutes.HIERARCHY_GROUP.PATH,
      pathParams: { companyId, applicationId },
    }),
  );

  return response.data;
}
