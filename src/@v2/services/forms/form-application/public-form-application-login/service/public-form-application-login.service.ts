import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface PublicFormLoginParams {
  applicationId: string;
  cpf: string;
  birthday: string;
}

export interface PublicFormLoginResponse {
  token: string;
}

export async function publicFormApplicationLogin({
  applicationId,
  cpf,
  birthday,
}: PublicFormLoginParams): Promise<PublicFormLoginResponse> {
  const response = await api.post<PublicFormLoginResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_PUBLIC_LOGIN,
      pathParams: { applicationId },
    }),
    {
      cpf,
      birthday,
    },
  );

  return response.data;
}
