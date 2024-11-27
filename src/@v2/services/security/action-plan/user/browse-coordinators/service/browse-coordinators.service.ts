import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseCoordinatorParams } from './browse-coordinators.types';
import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import {
  CoordinatorBrowseModel,
  ICoordinatorBrowseModel,
} from '@v2/models/security/models/coordinator/coordinator-browse.model';

export async function browseCoordinator({
  pagination,
  orderBy,
  companyId,
  filters = {},
}: BrowseCoordinatorParams) {
  const response = await api.get<ICoordinatorBrowseModel>(
    bindUrlParams({
      path: ActionPlanRoutes.COORDINATOR.BROWSE,
      pathParams: { companyId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new CoordinatorBrowseModel(response.data);
}
