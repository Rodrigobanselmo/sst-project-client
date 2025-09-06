import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormQuestionsAnswersBrowseModel,
  IFormQuestionsAnswersBrowseModel,
} from '@v2/models/form/models/form-questions-answers/form-questions-answers-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormQuestionsAnswersParams } from './browse-form-questions-answers.types';

export async function browseFormQuestionsAnswers({
  companyId,
  formApplicationId,
  search,
}: BrowseFormQuestionsAnswersParams) {
  const response = await api.get<IFormQuestionsAnswersBrowseModel>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.PATH,
      pathParams: { companyId },
      queryParams: { formApplicationId, search },
    }),
  );

  return new FormQuestionsAnswersBrowseModel(response.data);
}
