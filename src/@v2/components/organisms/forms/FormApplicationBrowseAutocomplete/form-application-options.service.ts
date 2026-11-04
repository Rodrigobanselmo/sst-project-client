import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { api } from 'core/services/apiClient';
import { FormTypeEnum } from '@v2/models/form/enums/form-type.enum';

export type FormApplicationOptions = {
  results: Array<{ id: string; name: string; form: { id: string; name: string; type: FormTypeEnum } }>;
  pagination: { page: number; limit: number; total: number };
};

export async function browseFormApplicationOptions(params: { companyId: string; search?: string; applicationId?: string }) {
  const { companyId, ...filters } = params;
  const response = await api.get<FormApplicationOptions>(bindUrlParams({
    path: FormRoutes.FORM_APPLICATION.PATH,
    pathParams: { companyId },
    queryParams: { view: 'options', page: 1, limit: 50, types: [FormTypeEnum.PSYCHOSOCIAL], ...filters },
  }));
  return response.data;
}
