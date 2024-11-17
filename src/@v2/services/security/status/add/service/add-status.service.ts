import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { StatusTypeEnum } from '@v2/models/security/enums/status-type.enum';
import { api } from 'core/services/apiClient';

export interface AddStatusParams {
  name: string;
  companyId: string;
  type: StatusTypeEnum;
  color?: string | null;
}

export async function addStatus({ companyId, ...body }: AddStatusParams) {
  await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.STATUS.ADD,
      pathParams: { companyId },
    }),
    body,
  );
}
