import type { IResolvedExamRiskConfig } from '../company-exam-risk-suggestions/company-exam-risk-suggestions.types';

export type ICompanyExamRiskAiSuggestionDecision = 'suggest' | 'exclude' | 'ambiguous';

export type ICompanyExamRiskAiExistingCompanyLink = {
  linkId: number;
  examId: number;
  examName: string;
};

export type ICompanyExamRiskAiExistingGlobalRule = {
  ruleId: string;
  status: string;
  scope: string;
};

export type ICompanyExamRiskAiSuggestionItem = {
  suggestionKey: string;
  examId: number;
  examName: string;
  decision: ICompanyExamRiskAiSuggestionDecision;
  confidence: number;
  rationale: string;
  inclusionReason?: string;
  exclusionReason?: string;
  cautions: string[];
  suggestedSource?: string;
  sourceRationale?: string;
  analysisStatus: string;
  candidateCompatibility: string;
  existingCompanyLink?: ICompanyExamRiskAiExistingCompanyLink;
  existingGlobalRule?: ICompanyExamRiskAiExistingGlobalRule;
  proposedConfig: IResolvedExamRiskConfig;
  isSelectable: boolean;
  selectionBlockReason?: string;
};

export type IDryRunCompanyExamRiskAiSuggestionsParams = {
  companyId: string;
  riskId: string;
  workspaceId?: string;
  examFilters?: {
    search?: string;
    examType?: string;
    onlyESocial?: boolean;
    limit?: number;
  };
  options?: {
    includeExistingLinks?: boolean;
    onlyWithoutCompanyLink?: boolean;
  };
  aiConfig?: {
    instructions?: string;
    positiveExamples?: string;
    negativeExamples?: string;
    cautionRules?: string;
    sessionInstruction?: string;
    model?: string;
  };
};

export type IDryRunCompanyExamRiskAiSuggestionsResponse = {
  companyId: string;
  riskId: string;
  riskName: string;
  workspaceId?: string;
  suggestions: ICompanyExamRiskAiSuggestionItem[];
  totals: {
    pairsAnalyzed: number;
    suggested: number;
    excluded: number;
    ambiguous: number;
    skippedExistingLink: number;
    skippedLowRelevance: number;
  };
  warnings: string[];
  promptPreview?: string;
  meta: {
    generatedAt: string;
    model: string;
  };
};

export enum CompanyExamRiskAiApplyItemStatusEnum {
  CREATED = 'CREATED',
  WOULD_CREATE = 'WOULD_CREATE',
  SKIPPED_ALREADY_LINKED = 'SKIPPED_ALREADY_LINKED',
  SKIPPED_DUPLICATE_REQUEST = 'SKIPPED_DUPLICATE_REQUEST',
  SKIPPED_NOT_CHARACTERIZED = 'SKIPPED_NOT_CHARACTERIZED',
  SKIPPED_NO_LIBRARY_REFERENCE = 'SKIPPED_NO_LIBRARY_REFERENCE',
  SKIPPED_NOT_ELIGIBLE = 'SKIPPED_NOT_ELIGIBLE',
  SKIPPED_LOW_RELEVANCE = 'SKIPPED_LOW_RELEVANCE',
  ERROR = 'ERROR',
}

export type IApplyCompanyExamRiskAiSuggestionsItem = {
  examId: number;
  rationale?: string;
};

export type IApplyCompanyExamRiskAiSuggestionsParams = {
  companyId: string;
  riskId: string;
  workspaceId?: string;
  dryRun?: boolean;
  clientRequestId?: string;
  items: IApplyCompanyExamRiskAiSuggestionsItem[];
};

export type IApplyCompanyExamRiskAiSuggestionItemResult = {
  examId: number;
  resolvedExamId: number;
  examName: string;
  status: CompanyExamRiskAiApplyItemStatusEnum;
  linkId?: number;
  message?: string;
  proposedConfig: IResolvedExamRiskConfig;
};

export type IApplyCompanyExamRiskAiSuggestionsResponse = {
  companyId: string;
  riskId: string;
  dryRun: boolean;
  items: IApplyCompanyExamRiskAiSuggestionItemResult[];
  summary: {
    requested: number;
    created: number;
    skipped: number;
    errors: number;
  };
  warnings: string[];
  meta: {
    generatedAt: string;
    workspaceId?: string;
    riskName: string;
  };
};
