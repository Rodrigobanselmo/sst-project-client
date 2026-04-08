import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { FormPreliminaryLibraryQuestionListItemApi } from '../../types/form-preliminary-library-api.types';

export interface ReadFormPreliminaryLibraryQuestionParams {
  companyId: string;
  questionId: string;
}

export async function readFormPreliminaryLibraryQuestion({
  companyId,
  questionId,
}: ReadFormPreliminaryLibraryQuestionParams) {
  const response = await api.get<FormPreliminaryLibraryQuestionListItemApi>(
    bindUrlParams({
      path: FormRoutes.FORM_PRELIMINARY_LIBRARY.QUESTION_ID,
      pathParams: { companyId, questionId },
    }),
  );

  return response.data;
}
