import { ExamRiskRuleCategoryEnum } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

export enum CompanyExamRiskSuggestionStatusEnum {
  MISSING_LINK = 'MISSING_LINK',
  ALREADY_LINKED = 'ALREADY_LINKED',
  CONFIG_DRIFT = 'CONFIG_DRIFT',
}

export enum CompanyExamRiskLibraryCoverageEnum {
  MATCHED_BY_RULE = 'MATCHED_BY_RULE',
  BIOLOGICAL_INDIRECT_ONLY = 'BIOLOGICAL_INDIRECT_ONLY',
  NO_GLOBAL_REFERENCE = 'NO_GLOBAL_REFERENCE',
}

export type ICompanyExamRiskGapRuleAudit = {
  ruleId: string;
  ruleScope: string;
  ruleSource: string;
  ruleStatus: 'ACTIVE';
  ruleExamRowId: string;
  sourceIndicatorId: string | null;
  isCurated: boolean;
  matchReason: string;
  referenceLabels: string[];
};

export type ICompanyExamRiskGapSuggestion = {
  suggestionKey: string;
  examId: number;
  examName: string;
  status: CompanyExamRiskSuggestionStatusEnum;
  isActionable: boolean;
  existingLinkId: number | null;
  driftFields: string[];
  primaryRule: ICompanyExamRiskGapRuleAudit;
  matchedRules: ICompanyExamRiskGapRuleAudit[];
};

export type ICompanyExamRiskGapRiskItem = {
  riskFactorId: string;
  name: string;
  type: ExamRiskRuleCategoryEnum;
  cas: string | null;
  esocialCode: string | null;
  isPcmso: boolean;
  subTypes: { id: number; name: string }[];
  libraryCoverage: CompanyExamRiskLibraryCoverageEnum;
  libraryCoverageNotes: string[];
  linkedExamCount: number;
  missingLinkCount: number;
  configDriftCount: number;
  alreadyLinkedCount: number;
  suggestions: ICompanyExamRiskGapSuggestion[];
};

export type ICompanyExamRiskGapsSummary = {
  totalRisks: number;
  risksWithMissingLinks: number;
  totalSuggestions: number;
  missingLinks: number;
  alreadyLinked: number;
  configDrifts: number;
  risksWithoutGlobalReference: number;
  byType: Record<ExamRiskRuleCategoryEnum, number>;
};

export type ICompanyExamRiskGapsMeta = {
  companyId: string;
  generatedAt: string;
  onlyPcmso: boolean;
  includeUnlinkedRisks: boolean;
  truncated: boolean;
  truncationMessage?: string;
};

export type ICompanyExamRiskGapsResponse = {
  summary: ICompanyExamRiskGapsSummary;
  items: ICompanyExamRiskGapRiskItem[];
  page: number;
  limit: number;
  count: number;
  meta: ICompanyExamRiskGapsMeta;
};

export type IBrowseCompanyExamRiskGapsParams = {
  companyId: string;
  page?: number;
  limit?: number;
  search?: string;
  type?: ExamRiskRuleCategoryEnum;
  suggestionStatus?: CompanyExamRiskSuggestionStatusEnum;
  actionableOnly?: boolean;
  includeConfigDrift?: boolean;
  onlyPcmso?: boolean;
};
