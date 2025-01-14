export const CharacterizationRoutes = {
  CHARACTERIZATION: {
    BROWSE: 'v2/companies/:companyId/workspaces/:workspaceId/characterizations',
    EDIT_MANY:
      'v2/companies/:companyId/workspaces/:workspaceId/characterizations/many',
  },
  STATUS: {
    ADD: 'v2/companies/:companyId/status',
    BROWSE: 'v2/companies/:companyId/status',
    EDIT: 'v2/companies/:companyId/status/:id',
    DELETE: 'v2/companies/:companyId/status/:id',
  },
} as const;
