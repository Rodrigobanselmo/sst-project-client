import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  ActionPlanHierarchyBrowseModel,
  IActionPlanHierarchyBrowseModel,
} from '@v2/models/security/models/action-plan-hierarchy/action-plan-hierarchy-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormHierarchiesParams } from './browse-form-hierarchies.types';

export async function browseFormHierarchies({
  pagination,
  orderBy,
  companyId,
  filters = {},
}: BrowseFormHierarchiesParams) {
  const response = await api.get<IActionPlanHierarchyBrowseModel>(
    bindUrlParams({
      path: FormRoutes.HIERARCHY.PATH,
      pathParams: { companyId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new ActionPlanHierarchyBrowseModel(response.data);
}
