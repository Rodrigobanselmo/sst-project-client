import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface DeleteFormPreliminaryLibraryQuestionParams {
  companyId: string;
  questionId: string;
}

export async function deleteFormPreliminaryLibraryQuestion({
  companyId,
  questionId,
}: DeleteFormPreliminaryLibraryQuestionParams) {
  await api.delete(
    bindUrlParams({
      path: FormRoutes.FORM_PRELIMINARY_LIBRARY.QUESTION_ID,
      pathParams: { companyId, questionId },
    }),
  );
}
