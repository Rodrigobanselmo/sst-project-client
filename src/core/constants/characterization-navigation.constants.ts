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
  [CharacterizationSubTabEnum.ENVIRONMENTS]: 'Ambientes e Atividades',
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

export type CharacterizationSubareaNavItem = {
  label: string;
  tab: CharacterizationSubTabEnum;
};

const CHARACTERIZATION_SUBAREA_TABS = [
  CharacterizationSubTabEnum.RISKS,
  CharacterizationSubTabEnum.ENVIRONMENTS,
  CharacterizationSubTabEnum.GSE,
  CharacterizationSubTabEnum.EXAMS,
  CharacterizationSubTabEnum.PROTOCOLS,
  CharacterizationSubTabEnum.ENTITY_RISKS,
] as const;

export function getCharacterizationSubareaNavItems(): CharacterizationSubareaNavItem[] {
  return CHARACTERIZATION_SUBAREA_TABS.map((tab) => ({
    tab,
    label: CHARACTERIZATION_SUB_TAB_LABELS[tab],
  }));
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
