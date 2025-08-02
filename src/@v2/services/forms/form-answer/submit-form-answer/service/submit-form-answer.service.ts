import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface FormAnswerData {
  questionId: string;
  value: string | string[] | number | Date;
}

export interface SubmitFormAnswerParams {
  applicationId: string;
  answers: FormAnswerData[];
}

export async function submitFormAnswer({
  applicationId,
  answers,
}: SubmitFormAnswerParams) {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_PUBLIC,
      pathParams: { applicationId },
    }),
    { answers },
  );

  return response.data;
}
