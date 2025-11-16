import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  EditFormQuestionsAnswersAnalysisParams,
  EditFormQuestionsAnswersAnalysisResponse,
} from './edit-form-questions-answers-analysis.types';

export async function editFormQuestionsAnswersAnalysis({
  companyId,
  applicationId,
  analysisId,
  analysis,
}: EditFormQuestionsAnswersAnalysisParams): Promise<EditFormQuestionsAnswersAnalysisResponse> {
  const response = await api.patch<EditFormQuestionsAnswersAnalysisResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.EDIT_ANALYSIS,
      pathParams: { companyId, applicationId, analysisId },
    }),
    { analysis },
  );

  return response.data;
}
