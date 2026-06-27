export const EsocialProcedureRoutes = {
  BASE: '/v2/master/esocial-procedures',
  EXPORT: '/v2/master/esocial-procedures/export',
  TEMPLATE: '/v2/master/esocial-procedures/template',
  IMPORT_PREVIEW: '/v2/master/esocial-procedures/import/preview',
  IMPORT_APPLY: '/v2/master/esocial-procedures/import/apply',
  BY_CODE: '/v2/master/esocial-procedures/:procedureCode',
  STATUS: '/v2/master/esocial-procedures/:id/status',
  BY_ID: '/v2/master/esocial-procedures/:id',
} as const;
