export const FORM_TAB_ENUM = {
  APPLIED: 'aplicados',
  MODEL: 'modelos',
};

export const PageRoutes = {
  DOCUMENTS: {
    LIST: '/dashboard/empresas/[companyId]/documentos',
    VIEW: '/dashboard/empresas/[companyId]/documentos/[id]',
  },
  FORMS: {
    FORMS_APPLICATION: {
      LIST: '/dashboard/empresas/[companyId]/formularios/[formTab]',
      VIEW: '/dashboard/empresas/[companyId]/formularios/aplicados/[id]',
      ADD: '/dashboard/empresas/[companyId]/formularios/aplicados/add',
      EDIT: '/dashboard/empresas/[companyId]/formularios/aplicados/[id]/edit',
    },
    FORMS_MODEL: {
      LIST: '/dashboard/empresas/[companyId]/formularios/modelos',
      ADD: '/dashboard/empresas/[companyId]/formularios/modelos/add',
      EDIT: '/dashboard/empresas/[companyId]/formularios/modelos/[id]',
      VIEW: '/dashboard/empresas/[companyId]/formularios/modelos/[id]',
    },
    PUBLIC_FORM_ANSWER: {
      NORMAL: '/formulario/[id]',
      TESTING: '/formulario/[id]/teste',
      LOGIN: '/formulario/[id]/login',
    },
  },
} as const;
