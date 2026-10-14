export const HomogeneousGroupRoutes = {
  AI_ANALYZE:
    'v2/companies/:companyId/workspaces/:workspaceId/homogeneous-groups/:gseId/ai-analyze',
  CATALOG_ONLY_AI_IDENTIFICATION_HISTORY:
    'v2/companies/:companyId/workspaces/:workspaceId/homogeneous-groups/:gseId/catalog-only-ai-identification-history',
  AI_ANALYZE_TRANSCRIBE:
    'v2/companies/:companyId/workspaces/:workspaceId/homogeneous-groups/:gseId/ai-analyze/transcribe',
  AI_TEMPORARY_SOURCE_PARSE_PDF:
    'v2/companies/:companyId/workspaces/:workspaceId/homogeneous-groups/:gseId/ai-temporary-source/parse-pdf',
} as const;
