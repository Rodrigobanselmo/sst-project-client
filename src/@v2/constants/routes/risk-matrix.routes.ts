export const RiskMatrixRoutes = {
  BASE: 'v2/companies/:companyId/risk-matrices',
  BY_ID: 'v2/companies/:companyId/risk-matrices/:matrixId',
  VERSIONS: 'v2/companies/:companyId/risk-matrices/:matrixId/versions',
  VERSION: 'v2/companies/:companyId/risk-matrices/:matrixId/versions/:versionId',
  PUBLISH:
    'v2/companies/:companyId/risk-matrices/:matrixId/versions/:versionId/publish',
  ARCHIVE: 'v2/companies/:companyId/risk-matrices/:matrixId/archive',
  WORKSPACE: 'v2/companies/:companyId/workspaces/:workspaceId/risk-matrices',
  WORKSPACE_VERSION:
    'v2/companies/:companyId/workspaces/:workspaceId/risk-matrices/:versionId',
  WORKSPACE_SWITCH:
    'v2/companies/:companyId/workspaces/:workspaceId/risk-matrices/switch',
} as const;
