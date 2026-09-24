export const RiskMatrixRoutes = {
  BASE: 'v2/companies/:companyId/risk-matrices',
  BY_ID: 'v2/companies/:companyId/risk-matrices/:matrixId',
  VERSIONS: 'v2/companies/:companyId/risk-matrices/:matrixId/versions',
  VERSION: 'v2/companies/:companyId/risk-matrices/:matrixId/versions/:versionId',
  PUBLISH:
    'v2/companies/:companyId/risk-matrices/:matrixId/versions/:versionId/publish',
  EDITORIAL:
    'v2/companies/:companyId/risk-matrices/:matrixId/versions/:versionId/editorial',
  ARCHIVE: 'v2/companies/:companyId/risk-matrices/:matrixId/archive',
  DUPLICATE: 'v2/companies/:companyId/risk-matrices/:matrixId/duplicate',
  WORKSPACE_AVAILABILITY:
    'v2/companies/:companyId/risk-matrices/:matrixId/workspace-availability',
  WORKSPACE: 'v2/companies/:companyId/workspaces/:workspaceId/risk-matrices',
  WORKSPACE_VERSION:
    'v2/companies/:companyId/workspaces/:workspaceId/risk-matrices/:versionId',
  WORKSPACE_SWITCH:
    'v2/companies/:companyId/workspaces/:workspaceId/risk-matrices/switch',
  SYSTEM: 'v2/master/system-risk-matrix',
  SYSTEM_PRESENTATION:
    'v2/companies/:companyId/risk-matrices/system-presentation',
} as const;
