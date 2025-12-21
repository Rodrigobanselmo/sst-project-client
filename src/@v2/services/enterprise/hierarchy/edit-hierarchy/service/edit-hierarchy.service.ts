import { HierarchyRoutes } from '@v2/constants/routes/hierarchy.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface EditHierarchyParams {
  companyId: string;
  hierarchyId: string;
  name?: string;
  description?: string | null;
  realDescription?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function editHierarchy({
  companyId,
  hierarchyId,
  ...body
}: EditHierarchyParams) {
  await api.patch(
    bindUrlParams({
      path: HierarchyRoutes.HIERARCHY.PATH_ID,
      pathParams: { companyId, hierarchyId },
    }),
    body,
  );
}
