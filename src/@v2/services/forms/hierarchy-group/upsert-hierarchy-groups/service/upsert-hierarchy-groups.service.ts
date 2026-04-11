import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface HierarchyGroupInput {
  id?: string;
  name: string;
  hierarchyIds: string[];
}

export interface UpsertHierarchyGroupsParams {
  companyId: string;
  applicationId: string;
  groups: HierarchyGroupInput[];
}

export async function upsertHierarchyGroups({
  companyId,
  applicationId,
  groups,
}: UpsertHierarchyGroupsParams) {
  const response = await api.put(
    bindUrlParams({
      path: FormRoutes.HIERARCHY_GROUP.PATH,
      pathParams: { companyId, applicationId },
    }),
    { groups },
  );

  return response.data;
}
