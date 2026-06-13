import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

export type ConsolidatedRiskNarrativeGroupingMode =
  | 'overview'
  | 'company'
  | 'application'
  | 'establishment'
  | 'sector'
  | 'riskFactor'
  | 'riskLevel'
  | 'status';

export type ConsolidatedRiskNarrativeFilters = {
  companyId?: string | null;
  formApplicationId?: string | null;
  riskLevel?: string | null;
  status?: string | null;
  search?: string | null;
};

export type ConsolidatedRiskNarrativeScope = {
  groupingMode: ConsolidatedRiskNarrativeGroupingMode;
  filters: ConsolidatedRiskNarrativeFilters;
};

export type ConsolidatedRiskNarrativeDiagnosticResult = {
  id: string;
  mode: 'virtual_consolidated';
  businessGroupId: number;
  businessGroupName: string;
  applicationIds: string[];
  scopeKey: string;
  scope: ConsolidatedRiskNarrativeScope;
  status: FormAiAnalysisStatusEnum;
  contentMarkdown?: string | null;
  metadata?: Record<string, unknown>;
  model?: string | null;
  processingTimeMs?: number | null;
  createdAt: string;
  updatedAt: string;
  analysesQueued?: boolean;
};

export type GenerateConsolidatedRiskNarrativeDiagnosticParams = {
  companyGroupId: number;
  applicationIds?: string[];
  scope: ConsolidatedRiskNarrativeScope;
  customPrompt?: string;
  model?: string;
  regenerate?: boolean;
};

export type ReadConsolidatedRiskNarrativeDiagnosticParams = {
  companyGroupId: number;
  applicationIds?: string[];
  scope: ConsolidatedRiskNarrativeScope;
};
