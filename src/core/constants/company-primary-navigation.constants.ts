import { CompanyActionEnum } from 'core/enums/company-action.enum';
import { RoutesEnum } from 'core/enums/routes.enums';
import { FORM_TAB_ENUM, PageRoutes } from '@v2/constants/pages/routes';
import { getCharacterizationSstPath } from './characterization-navigation.constants';

/**
 * Quatro áreas principais da gestão da empresa (ordem canônica).
 * Empresa → Pessoas → Caracterização → Documentos e programas.
 */
export const COMPANY_PRIMARY_STAGES = [
  CompanyActionEnum.COMPANY_GROUP_PAGE,
  CompanyActionEnum.EMPLOYEES_GROUP_PAGE,
  CompanyActionEnum.SST_GROUP_PAGE,
  CompanyActionEnum.DOCUMENTS_GROUP_PAGE,
] as const;

export type CompanyPrimaryStage = (typeof COMPANY_PRIMARY_STAGES)[number];

export const COMPANY_PRIMARY_STAGE_LABELS: Record<CompanyPrimaryStage, string> =
  {
    [CompanyActionEnum.COMPANY_GROUP_PAGE]: 'Dados da Empresa',
    [CompanyActionEnum.EMPLOYEES_GROUP_PAGE]: 'Funcionários',
    [CompanyActionEnum.SST_GROUP_PAGE]: 'Caracterização',
    [CompanyActionEnum.DOCUMENTS_GROUP_PAGE]: 'Programas e Laudos',
  };

export const COMPANY_MANAGEMENT_SIDEBAR_SECTION_LABEL = 'Gestão da Empresa';

export function isCompanyPrimaryStage(
  stage: string | undefined | null,
): stage is CompanyPrimaryStage {
  return (
    !!stage &&
    (COMPANY_PRIMARY_STAGES as readonly string[]).includes(stage)
  );
}

export function companyPrimaryStagePath(
  companyId: string,
  stage: CompanyPrimaryStage,
): string {
  if (stage === CompanyActionEnum.SST_GROUP_PAGE) {
    return getCharacterizationSstPath(companyId);
  }
  return RoutesEnum.COMPANY.replace(':companyId', companyId).replace(
    ':stage',
    stage,
  );
}

export type CompanyPrimaryNavItem = {
  stage: CompanyPrimaryStage;
  label: string;
  href: string;
};

/** Fonte canônica dos quatro módulos (sidebar, cards). */
export function getCompanyPrimaryNavItems(
  companyId: string,
): CompanyPrimaryNavItem[] {
  return COMPANY_PRIMARY_STAGES.map((stage) => ({
    stage,
    label: COMPANY_PRIMARY_STAGE_LABELS[stage],
    href: companyPrimaryStagePath(companyId, stage),
  }));
}

/** Itens da navegação contextual rápida do workspace (sem CAT). */
export type CompanyWorkspaceContextualNavId =
  | 'company-data'
  | 'employees'
  | 'characterization'
  | 'programs'
  | 'document-archive'
  | 'action-plan'
  | 'absenteeism'
  | 'forms';

export type CompanyWorkspaceContextualNavGroup =
  | 'management'
  | 'operations';

export type CompanyWorkspaceContextualNavItem = {
  id: CompanyWorkspaceContextualNavId;
  label: string;
  group: CompanyWorkspaceContextualNavGroup;
  /** Constrói href canônico; `tabWorkspaceId` só quando o destino o usa. */
  getHref: (params: {
    companyId: string;
    tabWorkspaceId?: string;
  }) => string;
  /** Matchers de pathname (sem query). */
  matchPathnames: string[];
};

function withOptionalWorkspace(
  base: string,
  tabWorkspaceId?: string,
  preserveWorkspace?: boolean,
): string {
  if (!preserveWorkspace || !tabWorkspaceId) return base;
  const query = new URLSearchParams({ tabWorkspaceId });
  return `${base}?${query.toString()}`;
}

export function getDocumentsArchivePath(companyId: string): string {
  return PageRoutes.DOCUMENTS.LIST.replace('[companyId]', companyId);
}

export function getAbsenteeismListPath(companyId: string): string {
  return RoutesEnum.ABSENTEEISM.replace(':companyId', companyId);
}

export function getFormsAppliedListPath(companyId: string): string {
  return PageRoutes.FORMS.FORMS_APPLICATION.LIST.replace(
    '[companyId]',
    companyId,
  ).replace('[formTab]', FORM_TAB_ENUM.APPLIED);
}

/**
 * Fonte canônica dos 8 itens da barra contextual.
 * Grupos: Gestão da Empresa | Operação e Registros.
 */
export const COMPANY_WORKSPACE_CONTEXTUAL_NAV_ITEMS: CompanyWorkspaceContextualNavItem[] =
  [
    {
      id: 'company-data',
      label: 'Dados da Empresa',
      group: 'management',
      matchPathnames: ['/dashboard/empresas/[companyId]/novo/empresa'],
      getHref: ({ companyId }) =>
        companyPrimaryStagePath(
          companyId,
          CompanyActionEnum.COMPANY_GROUP_PAGE,
        ),
    },
    {
      id: 'employees',
      label: 'Funcionários',
      group: 'management',
      matchPathnames: ['/dashboard/empresas/[companyId]/novo/empregados'],
      getHref: ({ companyId }) =>
        companyPrimaryStagePath(
          companyId,
          CompanyActionEnum.EMPLOYEES_GROUP_PAGE,
        ),
    },
    {
      id: 'characterization',
      label: 'Caracterização',
      group: 'management',
      matchPathnames: [
        '/dashboard/empresas/[companyId]/novo/sst',
        '/dashboard/empresas/[companyId]/produtos-quimicos',
        '/dashboard/empresas/[companyId]/assistente-gse',
      ],
      getHref: ({ companyId, tabWorkspaceId }) =>
        withOptionalWorkspace(
          companyPrimaryStagePath(companyId, CompanyActionEnum.SST_GROUP_PAGE),
          tabWorkspaceId,
          true,
        ),
    },
    {
      id: 'programs',
      label: 'Programas e Laudos',
      group: 'management',
      matchPathnames: ['/dashboard/empresas/[companyId]/novo/documentos'],
      getHref: ({ companyId, tabWorkspaceId }) =>
        withOptionalWorkspace(
          companyPrimaryStagePath(
            companyId,
            CompanyActionEnum.DOCUMENTS_GROUP_PAGE,
          ),
          tabWorkspaceId,
          true,
        ),
    },
    {
      id: 'document-archive',
      label: 'Acervo Técnico',
      group: 'management',
      matchPathnames: ['/dashboard/empresas/[companyId]/documentos'],
      getHref: ({ companyId, tabWorkspaceId }) =>
        withOptionalWorkspace(
          getDocumentsArchivePath(companyId),
          tabWorkspaceId,
          true,
        ),
    },
    {
      id: 'action-plan',
      label: 'Plano de Ação',
      group: 'operations',
      matchPathnames: ['/dashboard/empresas/[companyId]/plano-de-acao'],
      getHref: ({ companyId, tabWorkspaceId }) =>
        withOptionalWorkspace(
          RoutesEnum.ACTION_PLAN.replace(':companyId', companyId),
          tabWorkspaceId,
          true,
        ),
    },
    {
      id: 'absenteeism',
      label: 'Absenteísmo',
      group: 'operations',
      matchPathnames: [
        '/dashboard/empresas/[companyId]/absenteismo/[absenteeismsTab]',
        '/dashboard/empresas/[companyId]/absenteismo/lista',
        '/dashboard/empresas/[companyId]/absenteismo/metricas',
      ],
      getHref: ({ companyId }) => getAbsenteeismListPath(companyId),
    },
    {
      id: 'forms',
      label: 'Formulários',
      group: 'operations',
      matchPathnames: [
        '/dashboard/empresas/[companyId]/formularios/[formTab]',
        '/dashboard/empresas/[companyId]/formularios',
      ],
      getHref: ({ companyId }) => getFormsAppliedListPath(companyId),
    },
  ];

function pathMatchesTemplate(
  pathname: string,
  asPathOnly: string,
  template: string,
  companyId: string,
): boolean {
  if (pathname === template || pathname.startsWith(`${template}/`)) {
    return true;
  }
  if (!companyId) return false;

  const concrete = template
    .replace('[companyId]', companyId)
    .replace('/[absenteeismsTab]', '')
    .replace('/[formTab]', '')
    .replace(/\/\[[^\]]+\]/g, '');

  return (
    asPathOnly === concrete ||
    asPathOnly.startsWith(`${concrete}/`) ||
    (concrete.endsWith('/absenteismo') &&
      asPathOnly.includes(`/${companyId}/absenteismo`)) ||
    (concrete.endsWith('/formularios') &&
      asPathOnly.includes(`/${companyId}/formularios`))
  );
}

/** Mapeia o segmento `:stage` de `/novo/[stage]` para o item contextual. */
export const COMPANY_PRIMARY_STAGE_TO_CONTEXTUAL_NAV_ID: Record<
  string,
  CompanyWorkspaceContextualNavId
> = {
  [CompanyActionEnum.COMPANY_GROUP_PAGE]: 'company-data',
  [CompanyActionEnum.EMPLOYEES_GROUP_PAGE]: 'employees',
  [CompanyActionEnum.SST_GROUP_PAGE]: 'characterization',
  [CompanyActionEnum.DOCUMENTS_GROUP_PAGE]: 'programs',
};

/**
 * Resolve o item ativo a partir do pathname Next (com placeholders), asPath
 * ou `stage` da rota `/novo/[stage]` (pathname Next não embute o valor concreto).
 */
export function resolveCompanyWorkspaceContextualActiveId(input: {
  pathname: string;
  asPath?: string;
  companyId?: string;
  /** Valor de `router.query.stage` quando pathname é `/novo/[stage]`. */
  stage?: string | null;
}): CompanyWorkspaceContextualNavId | null {
  const { pathname, asPath = '', companyId = '', stage = null } = input;
  const pathOnly = asPath.split('?')[0] || '';

  // /novo/[stage]: prioriza stage da query ou do asPath concreto.
  const stageToken =
    (typeof stage === 'string' && stage) ||
    pathOnly.match(/\/novo\/([^/]+)\/?$/)?.[1] ||
    null;
  if (
    stageToken &&
    COMPANY_PRIMARY_STAGE_TO_CONTEXTUAL_NAV_ID[stageToken] &&
    (pathname.includes('/novo/[stage]') ||
      pathname.includes('/novo/') ||
      /\/novo\/[^/]+\/?$/.test(pathOnly))
  ) {
    return COMPANY_PRIMARY_STAGE_TO_CONTEXTUAL_NAV_ID[stageToken];
  }

  for (const item of COMPANY_WORKSPACE_CONTEXTUAL_NAV_ITEMS) {
    for (const template of item.matchPathnames) {
      if (pathMatchesTemplate(pathname, pathOnly, template, companyId)) {
        return item.id;
      }
    }
  }

  if (
    pathname.includes('/produtos-quimicos') ||
    pathname.includes('/assistente-gse') ||
    pathOnly.includes('/produtos-quimicos') ||
    pathOnly.includes('/assistente-gse')
  ) {
    return 'characterization';
  }

  return null;
}

export function getCompanyWorkspaceContextualNavItems(params: {
  companyId: string;
  tabWorkspaceId?: string;
}): Array<CompanyWorkspaceContextualNavItem & { href: string }> {
  if (!params.companyId) return [];
  return COMPANY_WORKSPACE_CONTEXTUAL_NAV_ITEMS.map((item) => ({
    ...item,
    href: item.getHref(params),
  }));
}
