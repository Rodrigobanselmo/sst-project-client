export const CharacterizationRoutes = {
  CHARACTERIZATION: {
    BROWSE: 'v2/companies/:companyId/workspaces/:workspaceId/characterizations',
    EDIT_MANY:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/many',
    AI_ANALYZE:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-analyze',
    AI_CHARACTERIZATION_ASSIST:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-characterization-assist',
    AI_CHARACTERIZATION_ASSIST_TRACES:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-characterization-assist/traces',
    AI_CHARACTERIZATION_ASSIST_TRACE_APPLY:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-characterization-assist/traces/:traceId/apply',
    AI_CHARACTERIZATION_ASSIST_TRACE_MARK_SAVED:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-characterization-assist/traces/:traceId/mark-saved',
    AI_TEMPORARY_SOURCE_PARSE_PDF:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-temporary-source/parse-pdf',
  },
  PHOTO_RECOMMENDATION: {
    EDIT_MANY: 'v2/companies/:companyId/photo-recommendations/many',
  },
  STATUS: {
    ADD: 'v2/companies/:companyId/status',
    BROWSE: 'v2/companies/:companyId/status',
    EDIT: 'v2/companies/:companyId/status/:id',
    DELETE: 'v2/companies/:companyId/status/:id',
  },
} as const;
