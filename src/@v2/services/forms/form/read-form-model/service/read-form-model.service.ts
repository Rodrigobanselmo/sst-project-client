import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormReadModel,
  IFormReadModel,
} from '@v2/models/form/models/form/form-read.model';

import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface ReadFormParams {
  companyId: string;
  formId: string;
}

export async function readForm({ formId, companyId }: ReadFormParams) {
  const response = await api.get<IFormReadModel>(
    bindUrlParams({
      path: FormRoutes.FORM.PATH_ID,
      pathParams: { companyId, formId },
    }),
  );

  return new FormReadModel(response.data);
}
