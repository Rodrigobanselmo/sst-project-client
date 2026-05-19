import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { RoutesEnum } from 'core/enums/routes.enums';

import { getCharacterizationSstPath } from './characterization-navigation.constants';

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
