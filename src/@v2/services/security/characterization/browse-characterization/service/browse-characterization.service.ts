import {
  CharacterizationBrowseModel,
  ICharacterizationBrowseModel,
} from '@v2/models/security/models/characterization/characterization-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseCharacterizationParams } from './browse-characterization.types';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';

export async function browseCharacterization({
  pagination,
  orderBy,
  companyId,
  workspaceId,
  filters = {},
}: BrowseCharacterizationParams) {
  const response = await api.get<ICharacterizationBrowseModel>(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.BROWSE,
      pathParams: { companyId, workspaceId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new CharacterizationBrowseModel(response.data);
}
