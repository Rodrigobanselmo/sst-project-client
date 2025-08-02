import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormApplicationReadPublicModel,
  IFormApplicationReadPublicModel,
} from '@v2/models/form/models/form-application/form-application-read-public.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface PublicFormApplicationParams {
  applicationId: string;
}

export async function publicFormApplication({
  applicationId,
}: PublicFormApplicationParams) {
  const response = await api.get<{
    data: IFormApplicationReadPublicModel | null;
    isTesting: boolean;
    isPublic: boolean;
  }>(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_PUBLIC,
      pathParams: { applicationId },
    }),
  );

  return {
    data: response.data?.data
      ? new FormApplicationReadPublicModel(response.data.data)
      : null,
    isTesting: response.data?.isTesting,
    isPublic: response.data?.isPublic,
  };
}
