import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormBrowseModel,
  IFormBrowseModel,
} from '@v2/models/form/models/form/form-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormModelParams } from './browse-form-model.types';

export async function browseForm({
  companyId,
  filters,
  ...query
}: BrowseFormModelParams) {
  const response = await api.get<IFormBrowseModel>(
    bindUrlParams({
      path: FormRoutes.FORM.PATH,
      pathParams: { companyId },
      queryParams: { ...query, ...filters },
    }),
  );

  return new FormBrowseModel(response.data);
}
