export const RiskSubtypeCurationRoutes = {
  BASE: '/v2/master/risk-subtype-curation',
  RISKS: '/v2/master/risk-subtype-curation/risks',
  BULK_ASSIGN: '/v2/master/risk-subtype-curation/risks/bulk-assign',
  BULK_CLEAR: '/v2/master/risk-subtype-curation/risks/bulk-clear',
  SUGGEST_CANDIDATES: '/v2/master/risk-subtype-curation/risks/suggest-candidates',
} as const;
