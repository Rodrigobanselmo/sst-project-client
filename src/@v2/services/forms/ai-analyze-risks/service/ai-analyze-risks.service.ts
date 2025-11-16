import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  AiAnalyzeFormQuestionsRisksParams,
  Result,
} from './ai-analyze-risks.types';
import { FormRoutes } from '@v2/constants/routes/forms.routes';

export async function aiAnalyzeFormQuestionsRisks({
  companyId,
  formApplicationId,
  ...body
}: AiAnalyzeFormQuestionsRisksParams): Promise<Result> {
  const response = await api.post(
    bindUrlParams({
      path: FormRoutes.FORM_QUESTIONS_ANSWERS.AI_ANALYZE_RISKS,
      pathParams: { companyId, applicationId: formApplicationId },
    }),
    body,
  );

  return response.data;
}
