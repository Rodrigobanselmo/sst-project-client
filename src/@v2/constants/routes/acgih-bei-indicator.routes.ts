export const AcgihBeiIndicatorRoutes = {
  BASE: '/v2/master/acgih-bei-indicators',
  EXPORT: '/v2/master/acgih-bei-indicators/export',
  TEMPLATE: '/v2/master/acgih-bei-indicators/template',
  IMPORT_PREVIEW: '/v2/master/acgih-bei-indicators/import/preview',
  IMPORT_APPLY: '/v2/master/acgih-bei-indicators/import/apply',
  STATUS: '/v2/master/acgih-bei-indicators/:id/status',
  BY_ID: '/v2/master/acgih-bei-indicators/:id',
} as const;
