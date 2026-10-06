import { AiRiskAnalysisResponse } from '@v2/services/forms/ai-analyze-risks/service/ai-analyze-risks.types';

export type FormAiAnalysisItemReviewCommentModel = {
  id: string;
  body: string;
  authorId: number;
  authorName: string | null;
  createdAt: string | Date;
};

export type FormAiAnalysisItemReviewModel = {
  itemKind: string;
  itemAnchor: string;
  acceptedBy: number | null;
  acceptedByName: string | null;
  acceptedAt: string | Date | null;
  comments: FormAiAnalysisItemReviewCommentModel[];
};

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
  metadata?: Record<string, unknown>;
  model?: string;
  processingTimeMs?: number;
  createdAt: Date;
  updatedAt: Date;
  itemReviews?: FormAiAnalysisItemReviewModel[];
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
  metadata?: Record<string, unknown>;
  model?: string;
  processingTimeMs?: number;
  createdAt: Date;
  updatedAt: Date;
  itemReviews: FormAiAnalysisItemReviewModel[];

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
    this.metadata = params.metadata;
    this.model = params.model;
    this.processingTimeMs = params.processingTimeMs;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.itemReviews = params.itemReviews ?? [];
  }
}
