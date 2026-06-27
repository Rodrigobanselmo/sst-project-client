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
