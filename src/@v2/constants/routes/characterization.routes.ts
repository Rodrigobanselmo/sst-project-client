export const CharacterizationRoutes = {
  CHARACTERIZATION: {
    BROWSE: 'v2/companies/:companyId/workspaces/:workspaceId/characterizations',
  },
  ACTION_PLAN: {
    BROWSE: 'v2/companies/:companyId/action-plans',
  },
  STATUS: {
    ADD: 'v2/companies/:companyId/status',
    BROWSE: 'v2/companies/:companyId/status',
    EDIT: 'v2/companies/:companyId/status/:id',
    DELETE: 'v2/companies/:companyId/status/:id',
  },
} as const;
