import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

export type IndicatorsNarrativeDiagnosticScope = {
  groupingQuestionId?: string | null;
  participantGroupIds?: string[];
  groupingLabel?: string | null;
  showOnlyGroupIndicators: boolean;
};

export type IndicatorsNarrativeDiagnosticResult = {
  id: string;
  formApplicationId: string;
  scopeKey: string;
  scope: IndicatorsNarrativeDiagnosticScope;
  status: FormAiAnalysisStatusEnum;
  contentMarkdown?: string | null;
  metadata?: Record<string, unknown>;
  model?: string | null;
  processingTimeMs?: number | null;
  generatedBy?: number | null;
  createdAt: string;
  updatedAt: string;
  analysesQueued?: boolean;
};

export type GenerateIndicatorsNarrativeDiagnosticParams = {
  companyId: string;
  formApplicationId: string;
  scope: IndicatorsNarrativeDiagnosticScope;
  customPrompt?: string;
  model?: string;
  regenerate?: boolean;
};

export type ReadIndicatorsNarrativeDiagnosticParams = {
  companyId: string;
  formApplicationId: string;
  scope: IndicatorsNarrativeDiagnosticScope;
};
