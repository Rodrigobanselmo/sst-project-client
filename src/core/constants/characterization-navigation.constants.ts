import { RoutesEnum } from 'core/enums/routes.enums';

/** Subabas do grupo Caracterização na home da empresa (`/novo/sst`). */
export enum CharacterizationSubTabEnum {
  RISKS = 0,
  ENVIRONMENTS = 1,
  GSE = 2,
  EXAMS = 3,
  PROTOCOLS = 4,
  /** Tela transversal de vínculo de riscos por entidade (Hierarquia / Ambientes / GSE). */
  ENTITY_RISKS = 5,
}

export const CHARACTERIZATION_SUB_TAB_LABELS: Record<
  CharacterizationSubTabEnum,
  string
> = {
  [CharacterizationSubTabEnum.RISKS]: 'Riscos',
  [CharacterizationSubTabEnum.ENVIRONMENTS]: 'Elementos Caracterizados',
  [CharacterizationSubTabEnum.GSE]: 'GSE',
  [CharacterizationSubTabEnum.EXAMS]: 'Exames',
  [CharacterizationSubTabEnum.PROTOCOLS]: 'Protocolos',
  [CharacterizationSubTabEnum.ENTITY_RISKS]: 'Vínculo de Riscos',
};

export const CHARACTERIZATION_MODULE_LABEL = 'Caracterização';

/** Valor estável do segmento "Caracterização" no breadcrumb (`useLocation`). */
export const CHARACTERIZATION_MODULE_ROUTE_VALUE = 'caracterizacao-modulo';

export const COMPANY_SST_PATHNAME = '/dashboard/empresas/[companyId]/novo/[stage]';

export const COMPANY_SST_STAGE = 'sst';

export const CHEMICAL_PRODUCTS_PATHNAME =
  '/dashboard/empresas/[companyId]/produtos-quimicos';

export const CHEMICAL_PRODUCTS_NAV_LABEL = 'Produtos Químicos';

export type CharacterizationSubareaNavItem =
  | {
      kind: 'tab';
      tab: CharacterizationSubTabEnum;
      label: string;
    }
  | {
      kind: 'external';
      id: 'chemical-products';
      label: string;
    };

const CHARACTERIZATION_SUBAREA_TABS = [
  CharacterizationSubTabEnum.RISKS,
  CharacterizationSubTabEnum.GSE,
  CharacterizationSubTabEnum.ENVIRONMENTS,
  CharacterizationSubTabEnum.EXAMS,
  CharacterizationSubTabEnum.PROTOCOLS,
  CharacterizationSubTabEnum.ENTITY_RISKS,
] as const;

export function getCharacterizationSubareaNavItems(): CharacterizationSubareaNavItem[] {
  return [
    ...CHARACTERIZATION_SUBAREA_TABS.map((tab) => ({
      kind: 'tab' as const,
      tab,
      label: CHARACTERIZATION_SUB_TAB_LABELS[tab],
    })),
    {
      kind: 'external' as const,
      id: 'chemical-products' as const,
      label: CHEMICAL_PRODUCTS_NAV_LABEL,
    },
  ];
}

export function getChemicalProductsNavStep(): number {
  return getCharacterizationSubareaNavItems().findIndex(
    (item) => item.kind === 'external' && item.id === 'chemical-products',
  );
}

export function getChemicalProductsHref(params: {
  companyId: string;
  tabWorkspaceId?: string;
}): string {
  const base = RoutesEnum.CHEMICAL_PRODUCTS.replace(
    ':companyId',
    params.companyId,
  );
  if (!params.tabWorkspaceId) return base;
  const query = new URLSearchParams({
    tabWorkspaceId: params.tabWorkspaceId,
  });
  return `${base}?${query.toString()}`;
}

/** Wizard step index for display order (may differ from stable enum values). */
export function getCharacterizationWizardStep(
  tab: CharacterizationSubTabEnum,
): number {
  const step = CHARACTERIZATION_SUBAREA_TABS.indexOf(
    tab as (typeof CHARACTERIZATION_SUBAREA_TABS)[number],
  );
  return step >= 0 ? step : 0;
}

/** Resolve stable tab enum from current Wizard display step (ignore external nav). */
export function getCharacterizationTabFromWizardStep(
  step: number,
): CharacterizationSubTabEnum | null {
  const item = getCharacterizationSubareaNavItems()[step];
  if (!item || item.kind !== 'tab') return null;
  return item.tab;
}

export const CHARACTERIZATION_AMBIENTES_PATHNAME =
  '/dashboard/empresas/[companyId]/caracterizacao';

export const CHARACTERIZATION_GSE_PATHNAME =
  '/dashboard/empresas/[companyId]/grupos-homogenios';

export function getCharacterizationSstPath(companyId: string) {
  return RoutesEnum.COMPANY_SST.replace(':companyId', companyId);
}

/** Atalho para Caracterização > Vínculo de Riscos (`active=5`), preservando estabelecimento. */
export function getCharacterizationEntityRisksHref(params: {
  companyId: string;
  tabWorkspaceId?: string;
}): string {
  const query = new URLSearchParams({
    active: String(CharacterizationSubTabEnum.ENTITY_RISKS),
  });
  if (params.tabWorkspaceId) {
    query.set('tabWorkspaceId', params.tabWorkspaceId);
  }
  return `${getCharacterizationSstPath(params.companyId)}?${query.toString()}`;
}

export function parseCharacterizationActiveTab(
  active: string | string[] | undefined,
): CharacterizationSubTabEnum {
  const n = active != null ? Number(active) : 0;
  if (!Number.isFinite(n)) return CharacterizationSubTabEnum.RISKS;

  // Legado: índice 3 era "Plano de ação" (removido); hoje 3 = Exames.
  if (n === 3) return CharacterizationSubTabEnum.EXAMS;

  // Protocolos era índice 5 antes da remoção do Plano de ação; hoje Protocolos = 4.
  // Índice 5 = Vínculo de Riscos. Bookmarks antigos active=5 abrem a nova aba.
  // Use active=4 para Protocolos.

  if (
    n >= CharacterizationSubTabEnum.RISKS &&
    n <= CharacterizationSubTabEnum.ENTITY_RISKS
  ) {
    return n as CharacterizationSubTabEnum;
  }
  return CharacterizationSubTabEnum.RISKS;
}

export function getCharacterizationSubTabLabel(
  tab: CharacterizationSubTabEnum,
): string {
  return CHARACTERIZATION_SUB_TAB_LABELS[tab];
}
