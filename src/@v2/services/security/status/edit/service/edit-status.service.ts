import { SecurityRoutes } from '@v2/constants/routes/security.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface EditStatusParams {
  id: number;
  name: string;
  companyId: string;
  color?: string | null;
}

export async function editStatus({ companyId, ...body }: EditStatusParams) {
  await api.patch(
    bindUrlParams({
      path: SecurityRoutes.STATUS.EDIT,
      pathParams: { companyId },
    }),
    { ...body },
  );
}
