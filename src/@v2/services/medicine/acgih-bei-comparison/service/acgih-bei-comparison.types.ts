import { AcgihBeiIndicatorConfidenceEnum } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';

export enum AcgihBeiComparisonStatusEnum {
  ALREADY_COVERED = 'ALREADY_COVERED',
  DIVERGENT = 'DIVERGENT',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  NEW_CANDIDATE = 'NEW_CANDIDATE',
  LOW_CONFIDENCE_REVIEW = 'LOW_CONFIDENCE_REVIEW',
}

export enum AcgihBeiSuggestedActionEnum {
  ADD_REFERENCE_ONLY = 'ADD_REFERENCE_ONLY',
  REVIEW_DIVERGENCE = 'REVIEW_DIVERGENCE',
  CREATE_NEW_RULE_CANDIDATE = 'CREATE_NEW_RULE_CANDIDATE',
  IGNORE_OR_MONITOR = 'IGNORE_OR_MONITOR',
  LOW_CONFIDENCE_REVIEW = 'LOW_CONFIDENCE_REVIEW',
}

export enum AcgihBeiMatchStatusEnum {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  NONE = 'NONE',
}

export interface IAcgihBeiComparisonRow {
  acgihBeiId: string;
  substanceName: string;
  cas: string | null;
  determinant: string | null;
  biologicalMatrix: string | null;
  samplingTime: string | null;
  beiValue: string | null;
  unit: string | null;
  confidence: AcgihBeiIndicatorConfidenceEnum | null;
  nr7MatchStatus: AcgihBeiMatchStatusEnum;
  nr7IndicatorId: string | null;
  nr7SubstanceName: string | null;
  nr7IndicatorName: string | null;
  examRiskRuleMatchStatus: AcgihBeiMatchStatusEnum;
  examRiskRuleId: string | null;
  examRiskRuleSource: string | null;
  examNameSnapshot: string | null;
  ruleMatchMethod: 'VIA_NR7' | 'VIA_AGENT' | null;
  comparisonStatus: AcgihBeiComparisonStatusEnum;
  suggestedAction: AcgihBeiSuggestedActionEnum;
  technicalDiff: string;
  reviewNotes: string;
}

export interface IAcgihBeiComparisonTotals {
  total: number;
  alreadyCovered: number;
  divergent: number;
  needsReview: number;
  newCandidate: number;
  lowConfidenceReview: number;
}

export interface IBrowseAcgihBeiComparisonParams {
  page?: number;
  limit?: number;
  search?: string;
  comparisonStatus?: AcgihBeiComparisonStatusEnum;
  suggestedAction?: AcgihBeiSuggestedActionEnum;
  confidence?: AcgihBeiIndicatorConfidenceEnum;
}

export interface IBrowseAcgihBeiComparisonResponse {
  totals: IAcgihBeiComparisonTotals;
  data: IAcgihBeiComparisonRow[];
  page: number;
  limit: number;
  count: number;
}
