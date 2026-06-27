export const ExamRiskRuleRoutes = {
  BASE: '/v2/master/exam-risk-rules',
  RISK_CANDIDATES: '/v2/master/exam-risk-rules/risk-candidates',
  EXAM_CANDIDATES: '/v2/master/exam-risk-rules/exam-candidates',
  SYNC_NR07: '/v2/master/exam-risk-rules/sync-nr07',
  EXPORT: '/v2/master/exam-risk-rules/export',
  TEMPLATE: '/v2/master/exam-risk-rules/template',
  IMPORT_PREVIEW: '/v2/master/exam-risk-rules/import/preview',
  IMPORT_APPLY: '/v2/master/exam-risk-rules/import/apply',
  BY_ID: '/v2/master/exam-risk-rules/:id',
  STATUS: '/v2/master/exam-risk-rules/:id/status',
  REFERENCES: '/v2/master/exam-risk-rules/:ruleId/references',
  REFERENCE_BY_ID:
    '/v2/master/exam-risk-rules/:ruleId/references/:referenceId',
} as const;
