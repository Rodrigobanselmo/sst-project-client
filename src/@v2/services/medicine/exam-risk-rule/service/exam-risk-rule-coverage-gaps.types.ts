import { ExamRiskRuleCategoryEnum, ExamRiskRuleScopeEnum } from './exam-risk-rule.types';

export enum ExamRiskRuleCoverageStatusEnum {
  COVERED_BY_RULE = 'COVERED_BY_RULE',
  INDIRECT_BIOLOGICAL_ONLY = 'INDIRECT_BIOLOGICAL_ONLY',
  UNCOVERED = 'UNCOVERED',
}

export type IExamRiskRuleCoverageGapSubType = {
  id: number;
  name: string;
};

export type IExamRiskRuleCoverageGapConfirmedIndicator = {
  substanceName: string;
  confirmedExamNames: string[];
};

export interface IExamRiskRuleCoverageGapItem {
  riskFactorId: string;
  name: string;
  type: ExamRiskRuleCategoryEnum;
  cas: string | null;
  esocialCode: string | null;
  subTypes: IExamRiskRuleCoverageGapSubType[];
  coverageStatus: ExamRiskRuleCoverageStatusEnum;
  coverageReasons: string[];
  matchedRuleIds: string[];
  matchedRuleScopes: ExamRiskRuleScopeEnum[];
  matchedExamNames: string[];
  hasBiologicalIndicatorCoverage: boolean;
  hasConfirmedBiologicalIndicator: boolean;
  confirmedBiologicalIndicatorCount: number;
  confirmedExamCount: number;
  confirmedBiologicalIndicators: IExamRiskRuleCoverageGapConfirmedIndicator[];
  notes: string[];
}

export type IExamRiskRuleCoverageGapsByType = Record<
  ExamRiskRuleCategoryEnum,
  number
>;

export interface IExamRiskRuleCoverageGapsSummary {
  totalRisks: number;
  coveredByRule: number;
  uncovered: number;
  indirectBiologicalCoverageOnly: number;
  byType: IExamRiskRuleCoverageGapsByType;
}

export interface IExamRiskRuleCoverageGapsResponse {
  summary: IExamRiskRuleCoverageGapsSummary;
  items: IExamRiskRuleCoverageGapItem[];
  page: number;
  limit: number;
  count: number;
}

export interface IBrowseExamRiskRuleCoverageGapsParams {
  page?: number;
  limit?: number;
  type?: ExamRiskRuleCategoryEnum;
  search?: string;
  coverageStatus?: ExamRiskRuleCoverageStatusEnum;
  includeIndirect?: boolean;
  onlyPcmso?: boolean;
}
