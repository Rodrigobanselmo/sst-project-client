import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  ClearFormQuestionsAnswersAnalysisParams,
  ClearFormQuestionsAnswersAnalysisResponse,
} from './clear-form-questions-answers-analysis.types';

export async function clearFormQuestionsAnswersAnalysis({
  companyId,
  applicationId,
  ...payload
}: ClearFormQuestionsAnswersAnalysisParams): Promise<ClearFormQuestionsAnswersAnalysisResponse> {
  const response = await api.post<ClearFormQuestionsAnswersAnalysisResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.CLEAR_ANALYSIS,
      pathParams: { companyId, applicationId },
    }),
    payload,
  );

  return response.data;
}
