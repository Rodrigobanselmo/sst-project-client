import { AiAnalyzeFormQuestionsRisksModeEnum } from './ai-analyze-risks.types';

export class AiAnalyzeFormQuestionsRisksPayload {
  mode?: AiAnalyzeFormQuestionsRisksModeEnum;
  riskId?: string;
  hierarchyId?: string;
  customPrompt?: string;
  model?: string;
}
