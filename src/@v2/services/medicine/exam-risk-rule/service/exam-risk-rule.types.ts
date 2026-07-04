export enum ExamRiskRuleScopeEnum {
  RISK = 'RISK',
  GROUP = 'GROUP',
  CATEGORY = 'CATEGORY',
  AGENT = 'AGENT',
}

export enum ExamRiskRuleSourceEnum {
  NR_07 = 'NR_07',
  SIMPLE_SST = 'SIMPLE_SST',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER',
}

export enum ExamRiskRuleStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
}

export enum ExamRiskRuleCategoryEnum {
  BIO = 'BIO',
  QUI = 'QUI',
  FIS = 'FIS',
  ERG = 'ERG',
  ACI = 'ACI',
  OUTROS = 'OUTROS',
}

export enum ExamRiskRuleReferenceSourceEnum {
  ACGIH_BEI = 'ACGIH_BEI',
  NR_07 = 'NR_07',
  SIMPLE_SST = 'SIMPLE_SST',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER',
}

export enum ExamRiskRuleReferenceStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

/** Fonte/evidência complementar de uma regra (Fase 4I). */
export interface IExamRiskRuleReference {
  id: string;
  sourceType: ExamRiskRuleReferenceSourceEnum;
  acgihBeiIndicatorId: string | null;
  nr7IndicatorId: string | null;
  referenceLabel: string | null;
  referenceYear: number | null;
  created_at: string;
}

export interface IExamRiskRuleExam {
  id: string;
  ruleId: string;
  examId: number | null;
  examNameSnapshot: string | null;
  isAdmission: boolean;
  isPeriodic: boolean;
  isChange: boolean;
  isReturn: boolean;
  isDismissal: boolean;
  isMale: boolean;
  isFemale: boolean;
  validityInMonths: number | null;
  considerBetweenDays: number | null;
  fromAge: number | null;
  toAge: number | null;
  minRiskDegree: number | null;
  minRiskDegreeQuantity: number | null;
  collectionToleranceDays: number | null;
  collectionMoment: string | null;
}

export interface IExamRiskRule {
  id: string;
  scope: ExamRiskRuleScopeEnum;
  riskFactorId: string | null;
  riskCategory: ExamRiskRuleCategoryEnum | null;
  riskSubTypeId: number | null;
  agentCas: string | null;
  agentName: string | null;
  agentNameNormalized: string | null;
  riskNameSnapshot: string | null;
  subTypeNameSnapshot: string | null;
  source: ExamRiskRuleSourceEnum;
  status: ExamRiskRuleStatusEnum;
  rationale: string | null;
  sourceIndicatorId: string | null;
  isCurated: boolean;
  createdById: number | null;
  /** Read-model: fator de risco SimpleSST para exibição (browse enriquecido). */
  linkedRiskFactorId?: string | null;
  riskFactorDisplayName?: string | null;
  normativeOriginLabel?: string | null;
  /** Read-model: rótulo e origem da coluna Fonte (browse enriquecido). */
  sourceDisplayLabel?: string | null;
  sourceOriginType?:
    | 'NR_07'
    | 'ACGIH_BEI'
    | 'TECHNICAL'
    | 'SIMPLE_SST'
    | 'OTHER'
    | null;
  sourceOriginId?: string | null;
  exams: IExamRiskRuleExam[];
  // Fontes complementares ativas (Fase 4I) — read-only no browse.
  references?: IExamRiskRuleReference[];
  created_at: string;
  updated_at: string;
}

export interface IExamRiskRuleNr07SyncSummary {
  totalIndicators: number;
  created: number;
  updated: number;
  unchanged: number;
  curatedSkipped: number;
  active: number;
  draft: number;
  draftReasons: Record<string, number>;
}

export const EXAM_RISK_RULE_SYNC_ACGIH_CONFIRM_TEXT = 'SINCRONIZAR ACGIH';

export type ExamRiskRuleAcgihSyncAction =
  | 'ruleCreated'
  | 'referenceCreated'
  | 'alreadySynced'
  | 'blocked'
  | 'failed';

export interface IExamRiskRuleAcgihSyncItem {
  indicatorId: string;
  substanceName: string;
  riskFactorId?: string;
  riskName?: string;
  examId?: number;
  examName?: string;
  action: ExamRiskRuleAcgihSyncAction;
  reason?: string;
  ruleId?: string;
  referenceId?: string;
}

export interface IExamRiskRuleAcgihSyncTotals {
  indicators: number;
  eligible: number;
  rulesCreated: number;
  referencesCreated: number;
  alreadySynced: number;
  blocked: number;
  failed: number;
}

export interface IExamRiskRuleAcgihSyncResponse {
  dryRun: boolean;
  totals: IExamRiskRuleAcgihSyncTotals;
  items: IExamRiskRuleAcgihSyncItem[];
}

export interface IExamRiskRuleAcgihSyncParams {
  confirmText: string;
  dryRun?: boolean;
}

export interface IBrowseExamRiskRulesResponse {
  count: number;
  data: IExamRiskRule[];
  page: number;
  limit: number;
}

export interface IBrowseExamRiskRulesParams {
  page?: number;
  limit?: number;
  search?: string;
  scope?: ExamRiskRuleScopeEnum;
  status?: ExamRiskRuleStatusEnum;
  source?: ExamRiskRuleSourceEnum;
}

export interface IExamRiskRuleExamInput {
  examId?: number;
  examNameSnapshot?: string;
  isAdmission?: boolean;
  isPeriodic?: boolean;
  isChange?: boolean;
  isReturn?: boolean;
  isDismissal?: boolean;
  isMale?: boolean;
  isFemale?: boolean;
  validityInMonths?: number | null;
  considerBetweenDays?: number | null;
  fromAge?: number | null;
  toAge?: number | null;
  minRiskDegree?: number | null;
  minRiskDegreeQuantity?: number | null;
}

export interface ICreateExamRiskRulePayload {
  scope: ExamRiskRuleScopeEnum;
  source: ExamRiskRuleSourceEnum;
  status?: ExamRiskRuleStatusEnum;
  rationale?: string | null;
  riskFactorId?: string | null;
  riskCategory?: ExamRiskRuleCategoryEnum | null;
  riskSubTypeId?: number | null;
  agentCas?: string | null;
  agentName?: string | null;
  exams?: IExamRiskRuleExamInput[];
}

export type IUpdateExamRiskRulePayload = Partial<ICreateExamRiskRulePayload>;

export interface IExamRiskRuleRiskCandidate {
  id: string;
  name: string;
  type: ExamRiskRuleCategoryEnum;
  cas: string | null;
}

export interface IExamRiskRuleExamCandidate {
  id: number;
  name: string;
  type: string | null;
  esocial27Code: string | null;
}

export enum ExamRiskRuleAiSuggestionMode {
  FROM_RULE = 'FROM_RULE',
  FROM_EXAM = 'FROM_EXAM',
  MANUAL = 'MANUAL',
}

export enum ExamRiskRuleAiAssistantPresetStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export type ExamRiskRuleAiDecision = 'include' | 'exclude' | 'ambiguous';

export interface IExamRiskRuleAiSuggestionRequest {
  mode: ExamRiskRuleAiSuggestionMode;
  modelRuleId?: string;
  exam?: {
    examId?: number;
    examName?: string;
    technicalObjective?: string;
    applicationCriteria?: string;
  };
  filters?: {
    riskType?: ExamRiskRuleCategoryEnum;
    includedSubTypeIds?: number[];
    excludedSubTypeIds?: number[];
    onlyActive?: boolean;
    onlyPcmso?: boolean;
    onlyWithoutRuleForExam?: boolean;
    search?: string;
    limit?: number;
  };
  suggestedRuleDefaults?: {
    source?: ExamRiskRuleSourceEnum;
    status?: ExamRiskRuleStatusEnum;
    rationalePrefix?: string;
    copyExamConfigFromModelRule?: boolean;
  };
  aiConfig?: {
    instructions?: string;
    positiveExamples?: string;
    negativeExamples?: string;
    cautionRules?: string;
    sessionInstruction?: string;
    model?: string;
  };
}

export interface IExamRiskRuleAiSuggestionCandidate {
  riskFactorId: string;
  riskName: string;
  riskType: ExamRiskRuleCategoryEnum;
  cas: string | null;
  esocialCode: string | null;
  subTypes: { id: number; name: string }[];
  decision: ExamRiskRuleAiDecision;
  confidence: number;
  rationale: string;
  inclusionReason?: string;
  exclusionReason?: string;
  cautions: string[];
  suggestedSource: ExamRiskRuleSourceEnum;
  sourceRationale: string;
  existingRule: {
    id: string;
    scope: ExamRiskRuleScopeEnum;
    source: ExamRiskRuleSourceEnum;
    status: ExamRiskRuleStatusEnum;
    matchedBy: ExamRiskRuleScopeEnum;
    examId: number | null;
    examName: string | null;
  } | null;
  wouldCreate?: {
    scope: ExamRiskRuleScopeEnum.RISK;
    riskFactorId: string;
    examId: number | null;
    examNameSnapshot: string;
    source: ExamRiskRuleSourceEnum;
    status: ExamRiskRuleStatusEnum.DRAFT;
    rationale: string;
    copiedFromModelRule?: { ruleId: string; fields: string[] };
    examConfig?: Record<string, unknown>;
  };
}

export interface IExamRiskRuleAiSuggestionResponse {
  dryRun: true;
  sourceContext: {
    mode: ExamRiskRuleAiSuggestionMode;
    modelRuleId?: string;
    examId: number | null;
    examName: string;
    technicalObjective?: string | null;
    applicationCriteria?: string | null;
    source: ExamRiskRuleSourceEnum;
  };
  totals: {
    candidatesLoaded: number;
    analyzed: number;
    include: number;
    exclude: number;
    ambiguous: number;
    skippedByExistingRule: number;
    skippedBySubtypeFilter: number;
  };
  candidates: IExamRiskRuleAiSuggestionCandidate[];
  warnings: string[];
  promptPreview: string;
}

export type ExamRiskRuleRiskToExamAiDecision =
  | 'suggest'
  | 'exclude'
  | 'ambiguous';

export interface IExamRiskRuleRiskToExamAiSuggestionRequest {
  context: 'MASTER_LIBRARY';
  selectedRiskFactorIds: string[];
  examFilters?: {
    search?: string;
    examType?: string;
    onlyESocial?: boolean;
    limit?: number;
  };
  options?: {
    includeExistingRules?: boolean;
    includeIndirectCoverage?: boolean;
    onlyWithoutExamCoverage?: boolean;
  };
  aiConfig?: {
    instructions?: string;
    positiveExamples?: string;
    negativeExamples?: string;
    cautionRules?: string;
    sessionInstruction?: string;
    model?: string;
  };
}

export interface IExamRiskRuleRiskToExamAiSuggestion {
  examId: number;
  examName: string;
  examType?: string | null;
  esocial27Code?: string | null;
  decision: ExamRiskRuleRiskToExamAiDecision;
  confidence: number;
  rationale: string;
  inclusionReason?: string;
  exclusionReason?: string;
  cautions?: string[];
  suggestedSource: ExamRiskRuleSourceEnum;
  sourceRationale: string;
  existingRule: {
    id: string;
    scope: ExamRiskRuleScopeEnum;
    source: ExamRiskRuleSourceEnum;
    status: ExamRiskRuleStatusEnum;
    matchedBy: ExamRiskRuleScopeEnum;
  } | null;
  existingIndirectCoverage?: Array<{
    indicatorId: string;
    substanceName: string;
    examId: number | null;
    examName: string | null;
  }>;
  wouldCreateGlobalDraft?: {
    scope: ExamRiskRuleScopeEnum.RISK;
    riskFactorId: string;
    examId: number;
    source: ExamRiskRuleSourceEnum;
    status: ExamRiskRuleStatusEnum.DRAFT;
    rationale: string;
  };
}

export interface IExamRiskRuleRiskToExamAiRiskResult {
  riskFactorId: string;
  riskName: string;
  riskType: ExamRiskRuleCategoryEnum;
  cas: string | null;
  esocialCode: string | null;
  subTypes: { id: number; name: string }[];
  existingCoverage?: {
    matchedRuleIds: string[];
    matchedRuleScopes: ExamRiskRuleScopeEnum[];
    indirectCoverageCount: number;
  };
  suggestions: IExamRiskRuleRiskToExamAiSuggestion[];
}

export interface IExamRiskRuleRiskToExamAiSuggestionResponse {
  dryRun: true;
  context: 'MASTER_LIBRARY';
  totals: {
    risksLoaded: number;
    examsLoaded: number;
    analyzedPairs: number;
    suggest: number;
    exclude: number;
    ambiguous: number;
    skippedExistingRule: number;
  };
  risks: IExamRiskRuleRiskToExamAiRiskResult[];
  warnings: string[];
  promptPreview?: string;
}

export interface ICreateExamRiskRuleAiDraftsPayload {
  sourceContext: IExamRiskRuleAiSuggestionResponse['sourceContext'] & {
    examId: number;
    onlyPcmso?: boolean;
  };
  selectedCandidates: Array<{
    riskFactorId: string;
    riskName: string;
    decision: ExamRiskRuleAiDecision;
    confidence: number;
    rationale: string;
    suggestedSource?: ExamRiskRuleSourceEnum;
    sourceRationale?: string;
    copiedFromModelRule?: { ruleId?: string; fields?: string[] };
    examConfig?: Record<string, unknown>;
  }>;
  options?: {
    allowAmbiguous?: boolean;
    rationalePrefix?: string;
    copyExamConfigFromModelRule?: boolean;
  };
}

export interface ICreateExamRiskRuleAiDraftsResponse {
  created: Array<{
    riskFactorId: string;
    riskName: string;
    decision: ExamRiskRuleAiDecision;
    ruleId: string;
    status: ExamRiskRuleStatusEnum.DRAFT;
    source: ExamRiskRuleSourceEnum;
  }>;
  skippedExistingRule: Array<{
    riskFactorId: string;
    riskName: string;
    decision: ExamRiskRuleAiDecision;
    reason: string;
    existingRule: {
      id: string;
      scope: ExamRiskRuleScopeEnum;
      matchedBy: ExamRiskRuleScopeEnum;
      status: ExamRiskRuleStatusEnum;
    };
  }>;
  skippedDecision: Array<{
    riskFactorId: string;
    riskName: string;
    decision: ExamRiskRuleAiDecision;
    reason: string;
  }>;
  failed: Array<{
    riskFactorId: string;
    riskName: string;
    decision: ExamRiskRuleAiDecision;
    reason: string;
  }>;
  totals: {
    totalSelected: number;
    created: number;
    skippedByExistingRule: number;
    skippedByDecision: number;
    failed: number;
  };
}

export interface IExamRiskRuleAiPreset {
  id: string;
  name: string;
  description: string | null;
  mode: ExamRiskRuleAiSuggestionMode;
  modelRuleId: string | null;
  examId: number | null;
  examName: string | null;
  technicalObjective: string | null;
  applicationCriteria: string | null;
  riskType: ExamRiskRuleCategoryEnum | null;
  riskSearch: string | null;
  includedSubTypeIds: number[];
  excludedSubTypeIds: number[];
  onlyActive: boolean;
  onlyPcmso: boolean;
  onlyWithoutRuleForExam: boolean;
  copyExamConfigFromModelRule: boolean;
  limit: number;
  suggestedSource: ExamRiskRuleSourceEnum;
  rationalePrefix: string | null;
  instructions: string | null;
  positiveExamples: string | null;
  negativeExamples: string | null;
  cautionRules: string | null;
  sessionInstruction: string | null;
  model: string | null;
  status: ExamRiskRuleAiAssistantPresetStatusEnum;
  createdById: number | null;
  updatedById: number | null;
  deletedById: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface IBrowseExamRiskRuleAiPresetsParams {
  search?: string;
  status?: ExamRiskRuleAiAssistantPresetStatusEnum;
  includeInactive?: boolean;
}

export type ICreateExamRiskRuleAiPresetPayload = Omit<
  IExamRiskRuleAiPreset,
  | 'id'
  | 'status'
  | 'createdById'
  | 'updatedById'
  | 'deletedById'
  | 'created_at'
  | 'updated_at'
  | 'deleted_at'
> & {
  status?: ExamRiskRuleAiAssistantPresetStatusEnum;
};

export type IUpdateExamRiskRuleAiPresetPayload =
  Partial<ICreateExamRiskRuleAiPresetPayload>;

// ── Import/Export Excel (Fase 4A.1) ─────────────────────────────────────────

export type ExamRiskRuleImportClassification =
  | 'CREATE'
  | 'UPDATE'
  | 'UNCHANGED'
  | 'REJECTED'
  | 'CONFLICT'
  | 'INVALID';

export interface IExamRiskRuleRowError {
  field: string;
  message: string;
}

export interface IExamRiskRuleFieldChange {
  field: string;
  from: string;
  to: string;
}

export interface IExamRiskRulePreviewLine {
  rowNumber: number;
  classification: ExamRiskRuleImportClassification;
  ruleId: string;
  ruleExamId: string;
  scope: string | null;
  referenceName: string | null;
  examId: number | null;
  examName: string | null;
  changedFields: string[];
  fieldChanges: IExamRiskRuleFieldChange[];
  warnings: string[];
  errors: IExamRiskRuleRowError[];
}

export interface IExamRiskRuleImportTotals {
  read: number;
  valid: number;
  create: number;
  update: number;
  unchanged: number;
  rejected: number;
  conflict: number;
  invalid: number;
}

export interface IExamRiskRuleImportPreviewResult {
  fileName: string;
  totals: IExamRiskRuleImportTotals;
  lines: IExamRiskRulePreviewLine[];
}

export interface IExamRiskRuleImportApplyResult {
  fileName: string;
  applied: {
    rulesUpdated: number;
    examsCreated: number;
    examsUpdated: number;
    unchanged: number;
    rejected: number;
    conflict: number;
    invalid: number;
  };
  totals: IExamRiskRuleImportTotals;
  affectedRuleIds: string[];
}
