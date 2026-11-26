import { AiRiskAnalysisResponse } from '@v2/services/forms/ai-analyze-risks/service/ai-analyze-risks.types';

export interface EditFormQuestionsAnswersAnalysisParams {
  companyId: string;
  applicationId: string;
  analysisId: string;
  hierarchyId?: string;
  riskId?: string;
  analysis: AiRiskAnalysisResponse;
}

export interface EditFormQuestionsAnswersAnalysisResponse {
  analysis: AiRiskAnalysisResponse;
}
