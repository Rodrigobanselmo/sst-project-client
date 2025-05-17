export const PageRoutes = {
  DOCUMENTS: {
    LIST: '/dashboard/empresas/[companyId]/documentos',
    VIEW: '/dashboard/empresas/[companyId]/documentos/[id]',
  },
  FORMS: {
    FORMS_APPLICATION: {
      LIST: '/dashboard/empresas/[companyId]/formularios/aplicacao',
      VIEW: '/dashboard/empresas/[companyId]/formularios/aplicacao/[id]',
    },
    FORMS_MODEL: {
      LIST: '/dashboard/empresas/[companyId]/formularios/modelos',
      ADD: '/dashboard/empresas/[companyId]/formularios/modelos/add',
      VIEW: '/dashboard/empresas/[companyId]/formularios/modelos/[id]',
    },
  },
} as const;
