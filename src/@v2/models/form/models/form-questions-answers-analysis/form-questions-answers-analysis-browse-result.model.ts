import { AiRiskAnalysisResponse } from '@v2/services/forms/ai-analyze-risks/service/ai-analyze-risks.types';

export enum FormAiAnalysisStatusEnum {
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
}

export type IFormQuestionsAnswersAnalysisBrowseResultModel = {
  id: string;
  companyId: string;
  formApplicationId: string;
  hierarchyId: string;
  riskId: string;
  status: FormAiAnalysisStatusEnum;
  probability?: number;
  confidence?: number;
  analysis: AiRiskAnalysisResponse | null;
  model?: string;
  processingTimeMs?: number;
  createdAt: Date;
  updatedAt: Date;
};

export class FormQuestionsAnswersAnalysisBrowseResultModel {
  id: string;
  companyId: string;
  formApplicationId: string;
  hierarchyId: string;
  riskId: string;
  status: FormAiAnalysisStatusEnum;
  probability?: number;
  confidence?: number;
  analysis: AiRiskAnalysisResponse | null;
  model?: string;
  processingTimeMs?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: IFormQuestionsAnswersAnalysisBrowseResultModel) {
    this.id = params.id;
    this.companyId = params.companyId;
    this.formApplicationId = params.formApplicationId;
    this.hierarchyId = params.hierarchyId;
    this.riskId = params.riskId;
    this.probability = params.probability;
    this.status = params.status;
    this.confidence = params.confidence;
    this.analysis = params.analysis;
    this.model = params.model;
    this.processingTimeMs = params.processingTimeMs;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }
}
