export const ExamRiskRuleRoutes = {
  BASE: '/v2/master/exam-risk-rules',
  RISK_CANDIDATES: '/v2/master/exam-risk-rules/risk-candidates',
  EXAM_CANDIDATES: '/v2/master/exam-risk-rules/exam-candidates',
  SYNC_NR07: '/v2/master/exam-risk-rules/sync-nr07',
  SYNC_ACGIH_BEI: '/v2/master/exam-risk-rules/sync-acgih-bei',
  EXPORT: '/v2/master/exam-risk-rules/export',
  TEMPLATE: '/v2/master/exam-risk-rules/template',
  IMPORT_PREVIEW: '/v2/master/exam-risk-rules/import/preview',
  IMPORT_APPLY: '/v2/master/exam-risk-rules/import/apply',
  AI_SUGGESTIONS_DRY_RUN:
    '/v2/master/exam-risk-rules/ai-suggestions/dry-run',
  AI_SUGGESTIONS_RISK_TO_EXAMS_DRY_RUN:
    '/v2/master/exam-risk-rules/ai-suggestions/risk-to-exams/dry-run',
  AI_SUGGESTIONS_RISK_TO_EXAMS_PRESETS:
    '/v2/master/exam-risk-rules/ai-suggestions/risk-to-exams/presets',
  AI_SUGGESTIONS_RISK_TO_EXAMS_PRESET_BY_ID:
    '/v2/master/exam-risk-rules/ai-suggestions/risk-to-exams/presets/:presetId',
  AI_SUGGESTIONS_RISK_TO_EXAMS_CREATE_DRAFTS:
    '/v2/master/exam-risk-rules/ai-suggestions/risk-to-exams/create-drafts',
  AI_SUGGESTIONS_CREATE_DRAFTS:
    '/v2/master/exam-risk-rules/ai-suggestions/create-drafts',
  AI_SUGGESTION_PRESETS:
    '/v2/master/exam-risk-rules/ai-suggestions/presets',
  AI_SUGGESTION_PRESET_BY_ID:
    '/v2/master/exam-risk-rules/ai-suggestions/presets/:presetId',
  BY_ID: '/v2/master/exam-risk-rules/:id',
  STATUS: '/v2/master/exam-risk-rules/:id/status',
  REFERENCES: '/v2/master/exam-risk-rules/:ruleId/references',
  REFERENCE_BY_ID:
    '/v2/master/exam-risk-rules/:ruleId/references/:referenceId',
  COVERAGE_GAPS: '/v2/master/exam-risk-rules/coverage-gaps',
  APPLY_PCMSO_DEFAULTS:
    '/v2/master/exam-risk-rules/apply-pcmso-defaults',
} as const;
