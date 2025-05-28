import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormApplicationBrowseModel,
  IFormApplicationBrowseModel,
} from '@v2/models/form/models/form-application/form-application-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormApplicationParams } from './browse-form-application.types';

export async function browseFormApplication({
  companyId,
  filters,
  ...query
}: BrowseFormApplicationParams) {
  const response = await api.get<IFormApplicationBrowseModel>(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH,
      pathParams: { companyId },
      queryParams: { ...query, ...filters },
    }),
  );

  return new FormApplicationBrowseModel(response.data);
}
