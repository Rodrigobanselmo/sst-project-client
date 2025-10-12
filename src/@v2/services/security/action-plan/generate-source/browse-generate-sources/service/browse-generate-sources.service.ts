import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import {
  GenerateSourceBrowseModel,
  IGenerateSourceBrowseModel,
} from '@v2/models/security/models/generate-source/generate-source-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseGenerateSourcesParams } from './browse-generate-sources.types';

export async function browseGenerateSources({
  pagination,
  orderBy,
  companyId,
  filters = {},
}: BrowseGenerateSourcesParams) {
  const response = await api.get<IGenerateSourceBrowseModel>(
    bindUrlParams({
      path: ActionPlanRoutes.GENERATE_SOURCE.BROWSE,
      pathParams: { companyId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new GenerateSourceBrowseModel(response.data);
}
