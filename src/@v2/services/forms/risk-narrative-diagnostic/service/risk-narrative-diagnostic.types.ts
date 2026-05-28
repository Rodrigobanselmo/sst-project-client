import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

export type RiskNarrativeDiagnosticScope = {
  groupingQuestionId?: string | null;
  participantGroupIds?: string[];
  allowedHierarchyIds?: string[] | null;
  groupingLabel?: string | null;
};

export type RiskNarrativeDiagnosticResult = {
  id: string;
  formApplicationId: string;
  scopeKey: string;
  scope: RiskNarrativeDiagnosticScope;
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

export type GenerateRiskNarrativeDiagnosticParams = {
  companyId: string;
  formApplicationId: string;
  scope: RiskNarrativeDiagnosticScope;
  customPrompt?: string;
  model?: string;
  regenerate?: boolean;
};

export type ReadRiskNarrativeDiagnosticParams = {
  companyId: string;
  formApplicationId: string;
  scope: RiskNarrativeDiagnosticScope;
};
