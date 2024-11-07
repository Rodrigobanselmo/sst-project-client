import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseActionPlanParams } from './action-plan-characterization.types';
import { SecurityRoutes } from '@v2/constants/routes/security.routes';
import {
  ActionPlanBrowseModel,
  IActionPlanBrowseModel,
} from '@v2/models/security/models/action-plan/action-plan-browse.model';

export async function browseActionPlan({
  pagination,
  orderBy,
  companyId,
  filters = {},
}: BrowseActionPlanParams) {
  const response = await api.get<IActionPlanBrowseModel>(
    bindUrlParams({
      path: SecurityRoutes.ACTION_PLAN.BROWSE,
      pathParams: { companyId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new ActionPlanBrowseModel(response.data);
}
