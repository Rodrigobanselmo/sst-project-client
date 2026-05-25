export const CompanyRoutes = {
  WORKSPACE: {
    BROWSE_ALL: 'v2/companies/:companyId/workspaces/all',
    CONVERT_TO_COMPANY: {
      COMPANY_GROUPS:
        'v2/companies/:companyId/workspaces/:workspaceId/convert-to-company/company-groups',
      PREVIEW:
        'v2/companies/:companyId/workspaces/:workspaceId/convert-to-company/preview',
      CONVERT:
        'v2/companies/:companyId/workspaces/:workspaceId/convert-to-company',
    },
  },
  VISUAL_IDENTITY: {
    READ: 'v2/companies/:companyId/visual-identity',
  },
} as const;
