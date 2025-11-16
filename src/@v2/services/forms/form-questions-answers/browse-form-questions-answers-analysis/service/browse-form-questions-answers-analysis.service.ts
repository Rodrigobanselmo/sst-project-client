import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormQuestionsAnswersAnalysisBrowseModel,
  IFormQuestionsAnswersAnalysisBrowseModel,
} from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormQuestionsAnswersAnalysisParams } from './browse-form-questions-answers-analysis.types';

export async function browseFormQuestionsAnswersAnalysis({
  companyId,
  applicationId,
}: BrowseFormQuestionsAnswersAnalysisParams) {
  const response = await api.get<IFormQuestionsAnswersAnalysisBrowseModel>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.BROWSE_ANALYSIS,
      pathParams: { companyId, applicationId },
    }),
  );

  return new FormQuestionsAnswersAnalysisBrowseModel(response.data);
}
