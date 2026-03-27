import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface DeleteFormModelParams {
  companyId: string;
  formId: string;
}

export async function deleteFormModel({ companyId, formId }: DeleteFormModelParams) {
  await api.delete(
    bindUrlParams({
      path: FormRoutes.FORM.PATH_ID,
      pathParams: { companyId, formId },
    }),
  );
}
