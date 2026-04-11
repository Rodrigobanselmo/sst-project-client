import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface DeleteHierarchyGroupParams {
  companyId: string;
  applicationId: string;
  groupId: string;
}

export async function deleteHierarchyGroup({
  companyId,
  applicationId,
  groupId,
}: DeleteHierarchyGroupParams) {
  const response = await api.delete(
    bindUrlParams({
      path: FormRoutes.HIERARCHY_GROUP.PATH_ID,
      pathParams: { companyId, applicationId, groupId },
    }),
  );

  return response.data;
}
