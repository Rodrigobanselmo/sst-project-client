import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import {
  ActionPlanHierarchyBrowseModel,
  IActionPlanHierarchyBrowseModel,
} from '@v2/models/security/models/action-plan-hierarchy/action-plan-hierarchy-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseActionPlanHierarchiesParams } from './browse-action-plan-hierarchies.types';

export async function browseActionPlanHierarchies({
  pagination,
  // orderBy,
  companyId,
  filters = {},
}: BrowseActionPlanHierarchiesParams) {
  const response = await api.get<IActionPlanHierarchyBrowseModel>(
    bindUrlParams({
      path: ActionPlanRoutes.HIERARCHY.BROWSE,
      pathParams: { companyId },
      queryParams: {
        // orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new ActionPlanHierarchyBrowseModel(response.data);
}
