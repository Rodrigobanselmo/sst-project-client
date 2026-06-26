export const ExamRiskRuleRoutes = {
  BASE: '/v2/master/exam-risk-rules',
  RISK_CANDIDATES: '/v2/master/exam-risk-rules/risk-candidates',
  EXAM_CANDIDATES: '/v2/master/exam-risk-rules/exam-candidates',
  SYNC_NR07: '/v2/master/exam-risk-rules/sync-nr07',
  BY_ID: '/v2/master/exam-risk-rules/:id',
  STATUS: '/v2/master/exam-risk-rules/:id/status',
} as const;
