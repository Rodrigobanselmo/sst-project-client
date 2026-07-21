export const CharacterizationRoutes = {
  CHARACTERIZATION: {
    BROWSE: 'v2/companies/:companyId/workspaces/:workspaceId/characterizations',
    EDIT_MANY:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/many',
    AI_ANALYZE:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-analyze',
    AI_CHARACTERIZATION_ASSIST:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-characterization-assist',
    AI_RISK_INVENTORY_SUMMARY:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-risk-inventory-summary',
    AI_CHARACTERIZATION_ASSIST_TRACES:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-characterization-assist/traces',
    AI_CHARACTERIZATION_ASSIST_TRACE_APPLY:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-characterization-assist/traces/:traceId/apply',
    AI_CHARACTERIZATION_ASSIST_TRACE_MARK_SAVED:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-characterization-assist/traces/:traceId/mark-saved',
    AI_TEMPORARY_SOURCE_PARSE_PDF:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/ai-temporary-source/parse-pdf',
    TECHNICAL_RECORDS:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/technical-records',
    TECHNICAL_RECORD:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/technical-records/:recordId',
    TECHNICAL_RECORD_CAPTURE_SNAPSHOT:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/technical-records/capture-snapshot',
    TECHNICAL_RECORD_IMPORT_URL_SUGGESTIONS:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/technical-records/import-url-suggestions',
    TECHNICAL_RECORD_AI_EVIDENCE_SUGGESTIONS:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/:characterizationId/technical-records/ai-evidence-suggestions',
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
