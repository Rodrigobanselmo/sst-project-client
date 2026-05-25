import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseResponsibleParams } from './browse-responsibles.types';
import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { PaginationModel } from '@v2/models/.shared/models/pagination.model';
import {
  IResponsibleBrowseModel,
  ResponsibleBrowseModel,
} from '@v2/models/security/models/responsible/responsible-browse.model';
import { ResponsibleBrowseFilterModel } from '@v2/models/security/models/responsible/responsible-browse-filter.model';

const emptyResponsibleBrowse = (limit = 15, page = 1): ResponsibleBrowseModel =>
  new ResponsibleBrowseModel({
    results: [],
    pagination: new PaginationModel({ total: 0, limit, page }),
    filters: new ResponsibleBrowseFilterModel({}),
  });

export async function browseResponsible({
  pagination,
  orderBy,
  companyId,
  filters = {},
}: BrowseResponsibleParams) {
  try {
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
  } catch {
    return emptyResponsibleBrowse(pagination?.limit, pagination?.page);
  }
}
