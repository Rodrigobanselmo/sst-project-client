import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormApplicationReadModel,
  IFormApplicationReadModel,
} from '@v2/models/form/models/form-application/form-application-read.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface ReadFormApplicationParams {
  companyId: string;
  applicationId: string;
}

export async function readFormApplication({
  applicationId,
  companyId,
}: ReadFormApplicationParams) {
  const response = await api.get<IFormApplicationReadModel>(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_ID,
      pathParams: { companyId, applicationId },
    }),
  );

  return new FormApplicationReadModel(response.data);
}
