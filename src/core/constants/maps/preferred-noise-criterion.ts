/**
 * Preferência do estabelecimento para ruído ocupacional contínuo (PGR).
 * Espelha PreferredNoiseCriterionEnum da API/Prisma.
 */
export enum PreferredNoiseCriterionEnum {
  NHO01_Q3 = 'NHO01_Q3',
  NR15_Q5 = 'NR15_Q5',
}

export const DEFAULT_PREFERRED_NOISE_CRITERION =
  PreferredNoiseCriterionEnum.NHO01_Q3;

export function normalizePreferredNoiseCriterion(
  value?: string | null,
): PreferredNoiseCriterionEnum {
  if (value === PreferredNoiseCriterionEnum.NR15_Q5) {
    return PreferredNoiseCriterionEnum.NR15_Q5;
  }
  return PreferredNoiseCriterionEnum.NHO01_Q3;
}

export const preferredNoiseCriterionOptions = [
  {
    value: PreferredNoiseCriterionEnum.NHO01_Q3,
    content: 'NHO 01 — Q3',
  },
  {
    value: PreferredNoiseCriterionEnum.NR15_Q5,
    content: 'NR-15 — Q5',
  },
] as const;

export const preferredNoiseCriterionHelp: Record<
  PreferredNoiseCriterionEnum,
  string
> = {
  [PreferredNoiseCriterionEnum.NHO01_Q3]:
    'Critério padrão SimpleSST para avaliação quantitativa de ruído no PGR.',
  [PreferredNoiseCriterionEnum.NR15_Q5]:
    'Utiliza o critério NR-15 Q5 para o risco ocupacional de ruído deste estabelecimento.',
};
