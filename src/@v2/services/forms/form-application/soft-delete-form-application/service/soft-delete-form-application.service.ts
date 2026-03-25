import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface SoftDeleteFormApplicationParams {
  companyId: string;
  applicationId: string;
}

export async function softDeleteFormApplication({
  companyId,
  applicationId,
}: SoftDeleteFormApplicationParams) {
  await api.delete(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_ID,
      pathParams: { companyId, applicationId },
    }),
  );
}
