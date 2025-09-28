import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface FormAnswerData {
  questionId: string;
  value?: string;
  optionIds?: string[];
}

export interface SubmitFormAnswerParams {
  applicationId: string;
  answers: FormAnswerData[];
  timeSpent?: number;
  encryptedEmployeeId?: string;
}

export async function submitFormAnswer({
  applicationId,
  answers,
  timeSpent,
  encryptedEmployeeId,
}: SubmitFormAnswerParams) {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_PUBLIC,
      pathParams: { applicationId },
      queryParams: { action: 'submit' },
    }),
    { answers, timeSpent, encryptedEmployeeId },
  );

  return response.data;
}
