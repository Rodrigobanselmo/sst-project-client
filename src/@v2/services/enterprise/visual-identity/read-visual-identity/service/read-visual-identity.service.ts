import { CompanyRoutes } from '@v2/constants/routes/company.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  IVisualIdentityModel,
  ReadVisualIdentityParams,
} from './read-visual-identity.types';

export async function readVisualIdentity({
  companyId,
}: ReadVisualIdentityParams) {
  const response = await api.get<IVisualIdentityModel | null>(
    bindUrlParams({
      path: CompanyRoutes.VISUAL_IDENTITY.READ,
      pathParams: { companyId },
    }),
  );

  return response.data;
}
