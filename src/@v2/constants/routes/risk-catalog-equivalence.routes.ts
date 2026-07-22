export const RiskCatalogEquivalenceRoutes = {
  BASE: '/v2/master/risk-catalog-equivalences',
  SEARCH: '/v2/master/risk-catalog-equivalences/search',
  IMPACT_PREVIEW: '/v2/master/risk-catalog-equivalences/impact-preview',
  CREATE_GLOBAL_CANONICAL:
    '/v2/master/risk-catalog-equivalences/create-global-canonical',
  REVOKE: '/v2/master/risk-catalog-equivalences/:id/revoke',
} as const;
