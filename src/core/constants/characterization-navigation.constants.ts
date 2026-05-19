import { RoutesEnum } from 'core/enums/routes.enums';

/** Subabas do grupo Caracterização na home da empresa (`/novo/sst`). */
export enum CharacterizationSubTabEnum {
  RISKS = 0,
  ENVIRONMENTS = 1,
  GSE = 2,
  EXAMS = 3,
  PROTOCOLS = 4,
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
};

export const CHARACTERIZATION_MODULE_LABEL = 'Caracterização';

export const COMPANY_SST_PATHNAME = '/dashboard/empresas/[companyId]/novo/[stage]';

export const CHARACTERIZATION_AMBIENTES_PATHNAME =
  '/dashboard/empresas/[companyId]/caracterizacao';

export const CHARACTERIZATION_GSE_PATHNAME =
  '/dashboard/empresas/[companyId]/grupos-homogenios';

export function getCharacterizationSstPath(companyId: string) {
  return RoutesEnum.COMPANY_SST.replace(':companyId', companyId);
}

export function parseCharacterizationActiveTab(
  active: string | string[] | undefined,
): CharacterizationSubTabEnum {
  const n = active != null ? Number(active) : 0;
  if (!Number.isFinite(n)) return CharacterizationSubTabEnum.RISKS;

  // Legado: índice 3 era "Plano de ação" (removido); hoje 3 = Exames.
  if (n === 3) return CharacterizationSubTabEnum.EXAMS;
  // Legado: Protocolos era índice 5 antes da remoção do Plano de ação.
  if (n === 5) return CharacterizationSubTabEnum.PROTOCOLS;

  if (
    n >= CharacterizationSubTabEnum.RISKS &&
    n <= CharacterizationSubTabEnum.PROTOCOLS
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
