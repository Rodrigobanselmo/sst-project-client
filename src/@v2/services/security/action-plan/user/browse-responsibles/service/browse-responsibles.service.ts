import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseResponsibleParams } from './browse-responsibles.types';
import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import {
  ResponsibleBrowseModel,
  IResponsibleBrowseModel,
} from '@v2/models/security/models/responsible/responsible-browse.model';

export async function browseResponsible({
  pagination,
  orderBy,
  companyId,
  filters = {},
}: BrowseResponsibleParams) {
  const response = await api.get<IResponsibleBrowseModel>(
    bindUrlParams({
      path: ActionPlanRoutes.RESPONSIBLE.BROWSE,
      pathParams: { companyId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new ResponsibleBrowseModel(response.data);
}
