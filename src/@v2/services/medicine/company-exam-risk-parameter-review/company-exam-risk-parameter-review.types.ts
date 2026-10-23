export type ExamRiskReviewGroup =
  | 'events'
  | 'validityInMonths'
  | 'sex'
  | 'age'
  | 'considerBetweenDays'
  | 'minRiskDegree'
  | 'minRiskDegreeQuantity';

export type ExamRiskReviewIdentity = {
  companyId: string;
  riskId: string;
  linkId: number;
  adoptedExamId: number;
  ruleId: string;
  ruleExamId: string;
  recommendedExamId: number;
};
export type ExamRiskParameterReview = {
  group: ExamRiskReviewGroup;
  state: 'EQUIVALENT' | 'UNREVIEWED' | 'ACCEPTED' | 'UNAVAILABLE';
  fingerprint: string;
  version: string | null;
  actorUserId: number | null;
  decidedAt: string | null;
  canReview: boolean;
  canReopen: boolean;
  hasAcceptance: boolean;
  snapshot: { recommended: unknown[]; adopted: unknown[] };
};
export type ExamRiskReviewResponse = {
  companyId: string;
  riskId: string;
  comparisons: Array<
    ExamRiskReviewIdentity & { groups: ExamRiskParameterReview[] }
  >;
};
export type ExamRiskReviewScope = {
  companyId: string;
  riskId: string;
  workspaceId?: string;
};
export type ExamRiskReviewPatch = {
  action: 'ACCEPT' | 'REOPEN';
  linkId: number;
  ruleId: string;
  ruleExamId: string;
  group: ExamRiskReviewGroup;
  expectedFingerprint: string;
  expectedVersion: string | null;
  workspaceId?: string;
};
