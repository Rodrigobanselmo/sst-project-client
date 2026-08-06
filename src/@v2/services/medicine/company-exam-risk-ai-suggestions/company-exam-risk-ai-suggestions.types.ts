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
  isAutoSelected?: boolean;
  analysisVerdict?: string;
};

export type ICompanyExamRiskAiExposureContext = {
  activityDescription?: string;
  materialsAgents?: string;
  contactForm?: string;
  frequencyDuration?: string;
  exposureRoutes?: string;
  volumeIntensity?: string;
  controlMeasures?: string;
  establishmentParticularities?: string;
  analysisPurpose?: string;
  physicianNotes?: string;
  externalRequirements?: string;
  sessionNotes?: string;
};

export type ICompanyExamRiskAiReviewedExam = {
  examId: number;
  examName: string;
  examType: string | null;
  origin: string;
  origins?: string[];
  originLabel: string;
  adoptionStatus: string;
  officialRuleId?: string | null;
  officialMatchReason?: string | null;
  companyLinkId?: number | null;
  officialConfigSummary?: string | null;
  companyConfigSummary?: string | null;
  biologicalIndicatorName?: string | null;
  verdict: string;
  purpose: string;
  recommendedDecisionStatus: string;
  confidence: number;
  rationale: string;
  conditions: string;
  pendingQuestions: string[];
  analysisStatus: string;
  analysisStatusReason: string;
  isSelectable: boolean;
  selectionBlockReason?: string;
};

export type ICompanyExamRiskAiProtocolItem = {
  examId: number;
  examName: string;
  origin: string;
  origins: string[];
  originLabel: string;
  protocolRole: string;
  verdict: string;
  purpose: string;
  rationale: string;
  conditions: string;
  isSelectable: boolean;
};

export type ICompanyExamRiskAiRecommendedOccupationalProtocol = {
  items: ICompanyExamRiskAiProtocolItem[];
  included: ICompanyExamRiskAiProtocolItem[];
  keptAdopted: ICompanyExamRiskAiProtocolItem[];
  newRecommended: ICompanyExamRiskAiProtocolItem[];
  conditional: ICompanyExamRiskAiProtocolItem[];
  notApplicable: ICompanyExamRiskAiProtocolItem[];
  needsInformation: ICompanyExamRiskAiProtocolItem[];
  summaryJustification: string;
  pendingQuestions: string[];
  humanValidationNotice: string;
};

export type ICompanyExamRiskAiReviewBlocks = {
  officialLibrary: ICompanyExamRiskAiReviewedExam[];
  biologicalIndicators?: ICompanyExamRiskAiReviewedExam[];
  clinicalBaseline?: ICompanyExamRiskAiReviewedExam[];
  companyAdopted: ICompanyExamRiskAiReviewedExam[];
  additionalSuggestions: ICompanyExamRiskAiReviewedExam[];
  pendingQuestions: string[];
  recommendedOccupationalProtocol?: ICompanyExamRiskAiRecommendedOccupationalProtocol;
};

export type ICompanyExamRiskAiPromptGuidanceDefault = {
  companyId: string;
  key: string;
  content: string;
  source: string;
  revision?: number | null;
  usedEmbeddedFallback?: boolean;
  systemAiPromptKeyPendingMigration?: boolean;
  relatedGenerationPromptKey?: string;
  note?: string;
};

export type IGenerateCompanyExamRiskAiPromptDraftCurrentFields = {
  modelName?: string;
  modelDescription?: string;
  examSearch?: string;
  examType?: string;
  suggestedCandidateLimit?: number;
  instructions?: string;
  positiveExamples?: string;
  negativeExamples?: string;
  cautions?: string;
  sessionAdditionalInstruction?: string;
};

export type IGenerateCompanyExamRiskAiPromptDraftParams = {
  companyId: string;
  riskId: string;
  workspaceId?: string;
  userGuidance?: string;
  currentFields?: IGenerateCompanyExamRiskAiPromptDraftCurrentFields;
  model?: string;
  sessionCustomPrompt?: string;
};

export type IGenerateCompanyExamRiskAiPromptDraftResponse = {
  riskId: string;
  riskName: string;
  riskType: 'ACI' | 'ERG' | 'QUI' | 'FIS' | 'BIO' | 'OUTROS';
  riskTypeLabel?: string;
  riskSubTypes?: { id: number; name: string }[];
  riskCas?: string | null;
  riskEsocialCode?: string | null;
  modelName: string;
  modelDescription: string;
  examSearch: string;
  examType?: string;
  suggestedCandidateLimit: number;
  instructions: string;
  positiveExamples: string;
  negativeExamples: string;
  cautions: string;
  sessionAdditionalInstruction: string;
  warnings: string[];
  meta: {
    generatedAt: string;
    model: string;
  };
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
    mode?: 'SUGGEST' | 'REVIEW';
  };
  exposureContext?: ICompanyExamRiskAiExposureContext;
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
  mode?: 'SUGGEST' | 'REVIEW';
  suggestions: ICompanyExamRiskAiSuggestionItem[];
  reviewBlocks?: ICompanyExamRiskAiReviewBlocks;
  exposureContext?: ICompanyExamRiskAiExposureContext | null;
  totals: {
    pairsAnalyzed: number;
    suggested: number;
    excluded: number;
    ambiguous: number;
    skippedExistingLink: number;
    skippedLowRelevance: number;
    officialEvaluated?: number;
    companyEvaluated?: number;
    additionalSuggested?: number;
    manualReviewRequired?: number;
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
