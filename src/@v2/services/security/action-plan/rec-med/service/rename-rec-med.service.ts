import { RecMedRoutes } from '@v2/constants/routes/rec-med.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import { RenameRecMedParams } from './rename-rec-med.types';

export async function renameRecMed(params: RenameRecMedParams) {
  const response = await api.patch(
    bindUrlParams({
      path: RecMedRoutes.RENAME,
      pathParams: { recMedId: params.recMedId },
    }),
    { recName: params.recName },
  );

  return response.data;
}
