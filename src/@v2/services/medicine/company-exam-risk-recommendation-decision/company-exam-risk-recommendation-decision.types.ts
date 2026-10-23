export type RecommendationDecisionScope = {
  companyId: string;
  workspaceId: string;
  riskId: string;
};
export type RecommendationDecisionPatch = {
  workspaceId: string;
  action: 'DECLINE' | 'RECONSIDER';
  ruleId: string;
  ruleExamId: string;
  recommendedExamId: number;
  expectedFingerprint: string;
  expectedVersion: string | null;
  reason?: string | null;
};
