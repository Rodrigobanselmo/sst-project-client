export const ExposureGroupAssistantRoutes = {
  DIAGNOSIS:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/diagnosis',
  SIMILARITY_PROPOSALS:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/similarity-proposals',
  SIMILARITY_PROPOSALS_REFINE_DRAFT:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/similarity-proposals/refine-draft',
  SIMILARITY_PROPOSALS_CREATE_PREVIEW:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/similarity-proposals/create-preview',
  SIMILARITY_PROPOSALS_CREATE:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/similarity-proposals/create',
  DEVELOPED_ROLE_DELETION_ELIGIBILITY:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/hierarchies/:hierarchyId/developed-role-deletion-eligibility',
  DEVELOPED_ROLE_DELETE:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/developed-roles/:hierarchyId',
  INTEGRITY_REVIEW_BULK_JUSTIFY_PREVIEW:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/integrity-reviews/bulk-justify/preview',
  INTEGRITY_REVIEW_BULK_JUSTIFY:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/integrity-reviews/bulk-justify',
  INTEGRITY_REVIEW_JUSTIFY:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/integrity-reviews/:elementId',
  INTEGRITY_REVIEW_REOPEN:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/integrity-reviews/:elementId/reopen',
} as const;
