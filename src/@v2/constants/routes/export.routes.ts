export const ExportRoutes = {
  CHARACTERIZATION: {
    EXPORT: 'files/report/characterization/:companyId',
  },
  ACTION_PLAN: {
    EXPORT: 'v2/companies/:companyId/action-plans/workspace/:workspaceId/export',
  },
} as const;
