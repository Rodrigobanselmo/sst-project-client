import { SubTypeRoutes } from '@v2/constants/routes/risk-type.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseSubTypeParams } from './browse-sub-type.types';
import {
  ISubTypeBrowseModel,
  SubTypeBrowseModel,
} from '@v2/models/security/models/risk/sub-type/sub-type-browse.model';

export async function browseSubType({
  companyId,
  filters,
  ...query
}: BrowseSubTypeParams) {
  const response = await api.get<ISubTypeBrowseModel>(
    bindUrlParams({
      path: SubTypeRoutes.SUB_TYPE.PATH,
      pathParams: { companyId },
      queryParams: { ...query, ...filters },
    }),
  );

  return new SubTypeBrowseModel(response.data);
}
