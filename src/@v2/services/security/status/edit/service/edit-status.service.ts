import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface EditStatusParams {
  id: number;
  name?: string;
  companyId: string;
  color?: string | null;
}

export async function editStatus({ companyId, id, ...body }: EditStatusParams) {
  await api.patch(
    bindUrlParams({
      path: CharacterizationRoutes.STATUS.EDIT,
      pathParams: { companyId, id },
    }),
    { ...body },
  );
}
