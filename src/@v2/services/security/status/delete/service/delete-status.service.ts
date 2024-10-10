import { SecurityRoutes } from '@v2/constants/routes/security.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface DeleteStatusParams {
  id: number;
  companyId: string;
}

export async function deleteStatus({ companyId, id }: DeleteStatusParams) {
  await api.delete(
    bindUrlParams({
      path: SecurityRoutes.STATUS.DELETE,
      pathParams: { companyId, id },
    }),
  );
}
