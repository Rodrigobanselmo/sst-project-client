import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { ClosingPrecheckResult } from './closing-precheck.types';

export interface ReadClosingPrecheckParams {
  companyId: string;
  applicationId: string;
}

export async function readClosingPrecheck({
  companyId,
  applicationId,
}: ReadClosingPrecheckParams) {
  const response = await api.get<ClosingPrecheckResult>(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_CLOSING_PRECHECK,
      pathParams: { companyId, applicationId },
    }),
  );

  return response.data;
}
