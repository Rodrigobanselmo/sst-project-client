import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { ConsolidatedAnalyticsGroupingMode } from '@v2/models/enterprise/company-group/consolidated-view-analytics.helpers';

export type ConsolidatedIndicatorsNarrativeScope = {
  groupingMode: ConsolidatedAnalyticsGroupingMode;
  participantGroupIds?: string[];
  groupingLabel?: string | null;
  showOnlyGroupIndicators: boolean;
};

export type ConsolidatedIndicatorsNarrativeDiagnosticResult = {
  id: string;
  mode: 'virtual_consolidated';
  businessGroupId: number;
  businessGroupName: string;
  applicationIds: string[];
  scopeKey: string;
  scope: ConsolidatedIndicatorsNarrativeScope;
  status: FormAiAnalysisStatusEnum;
  contentMarkdown?: string | null;
  metadata?: Record<string, unknown>;
  model?: string | null;
  processingTimeMs?: number | null;
  createdAt: string;
  updatedAt: string;
  analysesQueued?: boolean;
};

export type GenerateConsolidatedIndicatorsNarrativeDiagnosticParams = {
  companyGroupId: number;
  applicationIds?: string[];
  scope: ConsolidatedIndicatorsNarrativeScope;
  customPrompt?: string;
  model?: string;
  regenerate?: boolean;
};

export type ReadConsolidatedIndicatorsNarrativeDiagnosticParams = {
  companyGroupId: number;
  applicationIds?: string[];
  scope: ConsolidatedIndicatorsNarrativeScope;
};
