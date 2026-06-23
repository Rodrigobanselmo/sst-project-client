import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  RecoverStuckFormQuestionsAnswersAnalysisParams,
  RecoverStuckFormQuestionsAnswersAnalysisResponse,
} from './recover-stuck-form-questions-answers-analysis.types';

export async function recoverStuckFormQuestionsAnswersAnalysis({
  companyId,
  applicationId,
  ...payload
}: RecoverStuckFormQuestionsAnswersAnalysisParams): Promise<RecoverStuckFormQuestionsAnswersAnalysisResponse> {
  const response = await api.post<RecoverStuckFormQuestionsAnswersAnalysisResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.RECOVER_STUCK_ANALYSIS,
      pathParams: { companyId, applicationId },
    }),
    payload,
  );

  return response.data;
}
