import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { RoutesEnum } from 'core/enums/routes.enums';
import { getCharacterizationSstPath } from './characterization-navigation.constants';

export const COMPANIES_LIST_PATHNAME = '/dashboard/empresas';

export const isCompanyFlowPathname = (pathname: string) =>
  pathname.startsWith('/dashboard/empresas');

type BreadcrumbSegment = {
  name: string;
  value: string;
  onDropSelect?: () => void;
  action?: () => string | void;
};

/** Remove "Dashboard" do path e ancora o fluxo em Empresas. */
export function normalizeCompanyFlowBreadcrumbs(
  segments: BreadcrumbSegment[],
  pathname: string,
): BreadcrumbSegment[] {
  if (!isCompanyFlowPathname(pathname)) return segments;

  const withoutDashboard = segments.filter(
    (segment) =>
      segment.value !== 'dashboard' &&
      segment.name?.toLowerCase() !== 'dashboard',
  );

  const normalized = withoutDashboard.map((segment) =>
    segment.value === 'empresas'
      ? {
          ...segment,
          name: 'Empresas',
          action: () =>
            COMPANIES_LIST_PATHNAME.replace(/^\//, ''),
        }
      : segment,
  );

  if (
    pathname === COMPANIES_LIST_PATHNAME ||
    pathname === `${COMPANIES_LIST_PATHNAME}/`
  ) {
    return normalized.filter((segment) => segment.value === 'empresas');
  }

  return normalized;
}

export const COMPANY_HOME_PATHNAME =
  '/dashboard/empresas/[companyId]/novo/[stage]';

export const ABSENTEEISM_TAB_PATHNAME =
  '/dashboard/empresas/[companyId]/absenteismo/[absenteeismsTab]';

export const ACTION_PLAN_PATHNAME =
  '/dashboard/empresas/[companyId]/plano-de-acao';

export const FORMS_TAB_PATHNAME =
  '/dashboard/empresas/[companyId]/formularios/[formTab]';

export type CompanyAreaNavItem = {
  label: string;
  href: string;
};

const companyHomeStagePath = (companyId: string, stage: string) =>
  RoutesEnum.COMPANY.replace(':companyId', companyId).replace(':stage', stage);

export const getAbsenteeismListPath = (companyId: string) =>
  RoutesEnum.ABSENTEEISM.replace(':companyId', companyId);

export const getAbsenteeismMetricsPath = (companyId: string) =>
  getAbsenteeismListPath(companyId).replace('/lista', '/metricas');

export const getFormsAppliedListPath = (companyId: string) =>
  PageRoutes.FORMS.FORMS_APPLICATION.LIST.replace(
    '[companyId]',
    companyId,
  ).replace('[formTab]', FORM_TAB_ENUM.APPLIED);

export const COMPANY_STAGE_BREADCRUMB: Record<
  string,
  { label: string; getPath: (companyId: string) => string }
> = {
  [CompanyActionEnum.EMPLOYEES_GROUP_PAGE]: {
    label: 'Funcionários',
    getPath: (id) => companyHomeStagePath(id, CompanyActionEnum.EMPLOYEES_GROUP_PAGE),
  },
  [CompanyActionEnum.COMPANY_GROUP_PAGE]: {
    label: 'Dados da Empresa',
    getPath: (id) => companyHomeStagePath(id, CompanyActionEnum.COMPANY_GROUP_PAGE),
  },
  [CompanyActionEnum.DOCUMENTS_GROUP_PAGE]: {
    label: 'Documentos',
    getPath: (id) => companyHomeStagePath(id, CompanyActionEnum.DOCUMENTS_GROUP_PAGE),
  },
  [CompanyActionEnum.SST_GROUP_PAGE]: {
    label: 'Caracterização',
    getPath: (id) => getCharacterizationSstPath(id),
  },
};

export const FORM_TAB_BREADCRUMB_LABELS: Record<string, string> = {
  [FORM_TAB_ENUM.APPLIED]: 'Formulários Aplicados',
  [FORM_TAB_ENUM.MODEL]: 'Modelos de Formulário',
  [FORM_TAB_ENUM.PRELIMINARY_LIBRARY]: 'Biblioteca de Perguntas Preliminares',
};

/** Valor estável do segmento "Formulários" no breadcrumb (`useLocation`). */
/** Valor estável do segmento "Documentos" no breadcrumb (`useLocation`). */
export const DOCUMENTS_MODULE_ROUTE_VALUE = 'documentos-modulo';

export const DOCUMENT_TYPE_BREADCRUMB_LABELS: Record<number, string> = {
  0: 'PGR',
  1: 'PCMSO',
  2: 'PERICULOSIDADE',
  3: 'LTCAT',
  4: 'INSALUBRIDADE',
  5: 'FRPS',
};

export type DocumentsSubareaNavItem = {
  label: string;
  active: number;
};

export function getDocumentsSubareaNavItems(): DocumentsSubareaNavItem[] {
  return [
    { label: DOCUMENT_TYPE_BREADCRUMB_LABELS[0], active: 0 },
    { label: DOCUMENT_TYPE_BREADCRUMB_LABELS[1], active: 1 },
    { label: DOCUMENT_TYPE_BREADCRUMB_LABELS[2], active: 2 },
    { label: DOCUMENT_TYPE_BREADCRUMB_LABELS[3], active: 3 },
    { label: DOCUMENT_TYPE_BREADCRUMB_LABELS[4], active: 4 },
    { label: DOCUMENT_TYPE_BREADCRUMB_LABELS[5], active: 5 },
  ];
}

export function getDocumentsStagePath(companyId: string, active = 0) {
  const base = companyHomeStagePath(companyId, CompanyActionEnum.DOCUMENTS_GROUP_PAGE);
  return active > 0 ? `${base}?active=${active}` : base;
}

export const FORMS_MODULE_ROUTE_VALUE = 'formularios-modulo';

export type FormsSubareaNavItem = {
  label: string;
  formTab: string;
};

export function getFormsTabListPath(companyId: string, formTab: string) {
  return PageRoutes.FORMS.FORMS_APPLICATION.LIST.replace(
    '[companyId]',
    companyId,
  ).replace('[formTab]', formTab);
}

export function getFormsSubareaNavItems(): FormsSubareaNavItem[] {
  return [
    {
      label: FORM_TAB_BREADCRUMB_LABELS[FORM_TAB_ENUM.APPLIED],
      formTab: FORM_TAB_ENUM.APPLIED,
    },
    {
      label: FORM_TAB_BREADCRUMB_LABELS[FORM_TAB_ENUM.MODEL],
      formTab: FORM_TAB_ENUM.MODEL,
    },
    {
      label: FORM_TAB_BREADCRUMB_LABELS[FORM_TAB_ENUM.PRELIMINARY_LIBRARY],
      formTab: FORM_TAB_ENUM.PRELIMINARY_LIBRARY,
    },
  ];
}

/** Menu leve após o nome da empresa no breadcrumb (primeira versão). */
export function getCompanyAreaNavItems(companyId: string): CompanyAreaNavItem[] {
  return [
    {
      label: 'Funcionários',
      href: companyHomeStagePath(companyId, CompanyActionEnum.EMPLOYEES_GROUP_PAGE),
    },
    {
      label: 'Dados da Empresa',
      href: companyHomeStagePath(companyId, CompanyActionEnum.COMPANY_GROUP_PAGE),
    },
    {
      label: 'Caracterização',
      href: getCharacterizationSstPath(companyId),
    },
    {
      label: 'Documentos',
      href: companyHomeStagePath(companyId, CompanyActionEnum.DOCUMENTS_GROUP_PAGE),
    },
    {
      label: 'Plano de Ação',
      href: RoutesEnum.ACTION_PLAN.replace(':companyId', companyId),
    },
    {
      label: 'Absenteísmo',
      href: getAbsenteeismListPath(companyId),
    },
    {
      label: 'Formulários',
      href: getFormsAppliedListPath(companyId),
    },
  ];
}
