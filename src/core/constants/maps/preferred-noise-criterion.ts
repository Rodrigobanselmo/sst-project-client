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

type RouteQueryValue = string | string[] | undefined;

/**
 * Workspace inequívoco da rota: path `workspaceId` ou query `tabWorkspaceId`
 * (Caracterização / abas). Não infere o primeiro estabelecimento.
 */
export function resolveRouteWorkspaceId(query: {
  workspaceId?: RouteQueryValue;
  tabWorkspaceId?: RouteQueryValue;
}): string | undefined {
  const pick = (value?: RouteQueryValue): string | undefined => {
    if (Array.isArray(value)) {
      const first = value.find((item) => typeof item === 'string' && item);
      return first || undefined;
    }
    return value || undefined;
  };

  return pick(query.workspaceId) || pick(query.tabWorkspaceId);
}

type WorkspaceNoisePreferenceSource = {
  id: string;
  preferredNoiseCriterion?: string | null;
};

/**
 * Resolve a preferência só com match explícito de id em company.workspace.
 * Sem id / sem match → null (NoiseForm não mostra hint).
 * Campo ausente no workspace conhecido → default NHO01_Q3.
 */
export function resolveWorkspacePreferredNoiseCriterion(params: {
  workspaceId?: string | null;
  workspaces?: WorkspaceNoisePreferenceSource[] | null;
}): PreferredNoiseCriterionEnum | null {
  if (!params.workspaceId) return null;
  const workspace = params.workspaces?.find(
    (item) => item.id === params.workspaceId,
  );
  if (!workspace) return null;
  return normalizePreferredNoiseCriterion(workspace.preferredNoiseCriterion);
}

/** Texto informativo do NoiseForm (sem seletor). */
export function occupationalCriterionHint(
  criterion: PreferredNoiseCriterionEnum | null,
): string | null {
  if (!criterion) return null;
  if (criterion === PreferredNoiseCriterionEnum.NR15_Q5) {
    return 'Critério ocupacional do PGR: NR-15 — Q5.';
  }
  return 'Critério ocupacional do PGR: NHO 01 — Q3 (padrão SimpleSST).';
}
