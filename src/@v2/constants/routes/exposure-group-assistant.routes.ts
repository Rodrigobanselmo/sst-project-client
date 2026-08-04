export const ExposureGroupAssistantRoutes = {
  DIAGNOSIS:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/diagnosis',
  DEVELOPED_ROLE_DELETION_ELIGIBILITY:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/hierarchies/:hierarchyId/developed-role-deletion-eligibility',
  DEVELOPED_ROLE_DELETE:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/developed-roles/:hierarchyId',
  INTEGRITY_REVIEW_JUSTIFY:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/integrity-reviews/:elementId',
  INTEGRITY_REVIEW_REOPEN:
    'v2/companies/:companyId/workspaces/:workspaceId/exposure-group-assistant/integrity-reviews/:elementId/reopen',
} as const;
