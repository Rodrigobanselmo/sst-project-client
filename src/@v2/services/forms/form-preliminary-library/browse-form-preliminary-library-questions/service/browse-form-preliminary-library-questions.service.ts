import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormPreliminaryLibraryQuestionsResponse } from '../../types/form-preliminary-library-api.types';
import { BrowseFormPreliminaryLibraryQuestionsParams } from './browse-form-preliminary-library-questions.types';

export async function browseFormPreliminaryLibraryQuestions({
  companyId,
  category,
  search,
  page,
  limit,
}: BrowseFormPreliminaryLibraryQuestionsParams) {
  const response = await api.get<BrowseFormPreliminaryLibraryQuestionsResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_PRELIMINARY_LIBRARY.QUESTIONS,
      pathParams: { companyId },
      queryParams: {
        ...(category !== undefined ? { category } : {}),
        ...(search !== undefined && search !== '' ? { search } : {}),
        ...(page !== undefined ? { page } : {}),
        ...(limit !== undefined ? { limit } : {}),
      },
    }),
  );

  return response.data;
}
