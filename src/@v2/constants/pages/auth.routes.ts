export const AuthPageRoutes = {
  DOCUMENTS: {
    TABLE: '/dashboard/empresas/:companyId/documentos',
    VIEW: '/dashboard/empresas/:companyId/documentos/:id',
  },
  FORMS: {
    FORMS_APPLICATION: {
      TABLE: '/dashboard/empresas/:companyId/formularios',
      VIEW: '/dashboard/empresas/:companyId/formularios/:id',
    },
    TABLE: '/dashboard/empresas/:companyId/formularios/modelos',
    VIEW: '/dashboard/empresas/:companyId/formularios/modelos:id',
  },
} as const;
