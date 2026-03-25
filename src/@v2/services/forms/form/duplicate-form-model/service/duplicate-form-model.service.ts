import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface DuplicateFormModelParams {
  companyId: string;
  sourceFormId: string;
}

export interface DuplicateFormModelResponse {
  id: string;
}

export async function duplicateFormModel({
  companyId,
  sourceFormId,
}: DuplicateFormModelParams) {
  const { data } = await api.post<DuplicateFormModelResponse>(
    bindUrlParams({
      path: FormRoutes.FORM.PATH_ID_DUPLICATE,
      pathParams: { companyId, formId: sourceFormId },
    }),
  );

  return data;
}
