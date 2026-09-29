export const RiskInventoryRoutes = {
  BROWSE: 'v2/companies/:companyId/workspaces/:workspaceId/risk-inventory',
  COLUMNS: 'v2/companies/:companyId/workspaces/:workspaceId/risk-inventory/columns',
  SYSTEM_COLUMNS: 'v2/master/risk-inventory-columns',
} as const;
