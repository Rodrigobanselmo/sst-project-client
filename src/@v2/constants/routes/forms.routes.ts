export const FormRoutes = {
  FORM: {
    PATH: 'v2/companies/:companyId/forms/models/',
    PATH_ID: 'v2/companies/:companyId/forms/models/:formId',
    PATH_ID_DUPLICATE:
      'v2/companies/:companyId/forms/models/:formId/duplicate',
  },
  FORM_APPLICATION: {
    PATH: 'v2/companies/:companyId/forms/applications/',
    PATH_ID: 'v2/companies/:companyId/forms/applications/:applicationId',
    PATH_ASSIGN_RISKS:
      'v2/companies/:companyId/forms/applications/:applicationId/assign-risks',
    PATH_APPLY_AI_ANALYSIS_RISK_DATA:
      'v2/companies/:companyId/forms/applications/:applicationId/apply-ai-analysis-risk-data',
    PATH_RISK_LOGS:
      'v2/companies/:companyId/forms/applications/:applicationId/risk-logs',
    PATH_PUBLIC: 'v2/forms/applications/:applicationId/public',
    PATH_PUBLIC_LOGIN: 'v2/forms/applications/:applicationId/public/login',
  },
  FORM_QUESTIONS_ANSWERS: {
    PATH: 'v2/companies/:companyId/forms/questions-answers/',
    PATH_RISKS:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers/risks/',
    AI_ANALYZE_RISKS:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers/ai-analyze-risks',
    BROWSE_ANALYSIS:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers-analysis',
    EXPLAINABILITY_TECHNICAL_REPORT:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers-analysis/explainability-technical-report',
    CLEAR_ANALYSIS:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers-analysis/clear',
    RECOVER_STUCK_ANALYSIS:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers-analysis/recover-stuck',
    EDIT_ANALYSIS:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers-analysis/:analysisId',
    EXPLAIN_ITEM:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers-analysis/:analysisId/explain-item',
    EXPLAIN_ITEM_GENERATE:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers-analysis/:analysisId/explain-item/generate',
    EXPLAIN_ITEM_CONTEXTUAL_GENERATE:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers-analysis/:analysisId/explain-item/contextual/generate',
    EXPLAIN_ITEM_CONTEXTUAL:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers-analysis/:analysisId/explain-item/contextual',
    RISK_NARRATIVE_DIAGNOSTIC:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers/risk-narrative-diagnostic',
    INDICATORS_NARRATIVE_DIAGNOSTIC:
      'v2/companies/:companyId/forms/applications/:applicationId/questions-answers/indicators-narrative-diagnostic',
  },
  AI_EXPLANATIONS: {
    CONCEPTUAL: 'v2/system/ai-explanations/conceptual/:id',
    CONCEPTUAL_VALIDATE: 'v2/system/ai-explanations/conceptual/:id/validate',
    CONCEPTUAL_REJECT: 'v2/system/ai-explanations/conceptual/:id/reject',
    CONTEXTUAL: 'v2/system/ai-explanations/contextual/:id',
    CONTEXTUAL_VALIDATE: 'v2/system/ai-explanations/contextual/:id/validate',
    CONTEXTUAL_REJECT: 'v2/system/ai-explanations/contextual/:id/reject',
  },
  FRPS_EXPLAINABILITY_LIBRARY: {
    CONCEPTUAL: 'v2/system/frps-explainability-library/conceptual',
    CONCEPTUAL_GENERATE:
      'v2/system/frps-explainability-library/conceptual/generate',
    CATALOG_ADMIN: 'v2/system/frps-explainability-library/catalog-admin',
    CONCEPTUAL_STATUS:
      'v2/system/frps-explainability-library/conceptual-status',
  },
  RISK: {
    PATH: 'v2/companies/:companyId/forms/risks/',
  },
  HIERARCHY: {
    PATH: 'v2/companies/:companyId/forms/hierarchies/',
  },
  FORM_PARTICIPANTS: {
    PATH: 'v2/companies/:companyId/forms/applications/:applicationId/participants/',
    SEND_EMAIL:
      'v2/companies/:companyId/forms/applications/:applicationId/participants/send-email',
    SEND_REMINDER:
      'v2/companies/:companyId/forms/applications/:applicationId/participants/send-reminder',
  },
  /** Biblioteca de Perguntas Preliminares (Fase 1 API). */
  FORM_PRELIMINARY_LIBRARY: {
    QUESTIONS: 'v2/companies/:companyId/forms/preliminary-library/questions',
    QUESTION_ID:
      'v2/companies/:companyId/forms/preliminary-library/questions/:questionId',
    BLOCKS: 'v2/companies/:companyId/forms/preliminary-library/blocks',
    BLOCK_ID: 'v2/companies/:companyId/forms/preliminary-library/blocks/:blockId',
  },
  HIERARCHY_GROUP: {
    PATH: 'v2/companies/:companyId/forms/applications/:applicationId/hierarchy-groups/',
    PATH_ID:
      'v2/companies/:companyId/forms/applications/:applicationId/hierarchy-groups/:groupId',
  },
  SYSTEM_AI_PROMPT: {
    PATH: 'v2/system/ai-prompts',
  },
  FRPS_PRIVACY: {
    PATH: 'v2/companies/:companyId/frps-privacy',
  },
} as const;
