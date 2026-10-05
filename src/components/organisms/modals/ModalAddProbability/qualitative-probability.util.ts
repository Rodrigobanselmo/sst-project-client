/** Mesma fórmula do modal “Estimar Probabilidade”. Critério vazio fica fora da média. */
export type QualitativeProbabilityCriteria = {
  employeeCountTotal?: number | null;
  employeeCountGho?: number | null;
  minDurationJT?: number | null;
  minDurationEO?: number | null;
  chancesOfHappening?: number | null;
  frequency?: number | null;
  history?: number | null;
  medsImplemented?: number | null;
};

export type ProbabilityEstimateResult = {
  probability: number;
  criteria: QualitativeProbabilityCriteria;
};

export type ProbabilityCountSource = {
  hierarchyId?: string;
  homogeneousGroupId?: string;
  workspaceIds?: string[];
  ghoEmployeeCount?: number;
  allWorkspaces?: boolean;
};

export type CountSuggestionDecision =
  | { kind: 'none' }
  | {
      kind: 'auto';
      probability: number;
      criteria: QualitativeProbabilityCriteria;
    }
  | {
      kind: 'hint';
      probability: number;
      criteria: QualitativeProbabilityCriteria;
    };

export const percentageCheck = (value: number, limit: number) => {
  if (!value || !limit) return 0;

  const stage = value / limit;
  if (stage < 0.1) return 1;
  if (stage < 0.25) return 2;
  if (stage < 0.5) return 3;
  if (stage < 1) return 4;
  return 5;
};

/** Listas de controles existentes do Risco Real. Treinamento entra por `adms`. */
export type RealControlLists = {
  engs?: readonly unknown[] | null;
  adms?: readonly unknown[] | null;
  epis?: readonly unknown[] | null;
};

function hasControlItem(list?: readonly unknown[] | null): boolean {
  return !!list?.some((item) => item != null);
}

/**
 * Matriz canônica de medsImplemented a partir dos controles existentes.
 * 1 EPC+ADM+EPI, 2 EPC+ADM, 3 EPC+EPI ou ADM+EPI, 4 uma medida, 5 nenhuma.
 */
export function classifyMedsImplemented(
  lists: RealControlLists,
): 1 | 2 | 3 | 4 | 5 {
  const hasEpc = hasControlItem(lists.engs);
  const hasAdm = hasControlItem(lists.adms);
  const hasEpi = hasControlItem(lists.epis);
  const count = Number(hasEpc) + Number(hasAdm) + Number(hasEpi);

  if (count === 0) return 5;
  if (count === 1) return 4;
  if (hasEpc && hasAdm && hasEpi) return 1;
  if (hasEpc && hasAdm) return 2;
  return 3;
}

/**
 * Jornada a mostrar na abertura. Com critérios adotados, preserva o snapshot.
 * Sem adoção, preenche só quando há uma única duração conhecida.
 */
export function journeyMinutesForModalOpen(params: {
  adopted?: QualitativeProbabilityCriteria | null;
  suggestedMinutes?: number | null;
}): number | null {
  if (params.adopted) return params.adopted.minDurationJT ?? null;
  if (params.suggestedMinutes != null && params.suggestedMinutes > 0) {
    return params.suggestedMinutes;
  }
  return null;
}

/**
 * Valor do rádio na abertura.
 * Com critérios adotados, preserva a escolha.
 * Sem adoção, pré-seleciona a classificação atual dos controles.
 * A sugestão contínua continua sendo `classifyMedsImplemented`.
 */
export function medsImplementedForModalOpen(params: {
  adopted?: QualitativeProbabilityCriteria | null;
  controls?: RealControlLists | null;
}): number | null {
  if (params.adopted) return params.adopted.medsImplemented ?? null;
  if (!params.controls) return null;
  return classifyMedsImplemented(params.controls);
}

export function adoptedCriteriaInt(value: unknown): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

export function criteriaFromForm(values: {
  employeeCountTotal?: unknown;
  employeeCountGho?: unknown;
  minDurationJT?: unknown;
  minDurationEO?: unknown;
  chancesOfHappening?: unknown;
  frequency?: unknown;
  history?: unknown;
  medsImplemented?: unknown;
}): QualitativeProbabilityCriteria {
  return {
    employeeCountTotal: adoptedCriteriaInt(values.employeeCountTotal),
    employeeCountGho: adoptedCriteriaInt(values.employeeCountGho),
    minDurationJT: adoptedCriteriaInt(values.minDurationJT),
    minDurationEO: adoptedCriteriaInt(values.minDurationEO),
    chancesOfHappening: adoptedCriteriaInt(values.chancesOfHappening),
    frequency: adoptedCriteriaInt(values.frequency),
    history: adoptedCriteriaInt(values.history),
    medsImplemented: adoptedCriteriaInt(values.medsImplemented),
  };
}

/** Componentes que entram na média. Cada rádio vale um. Cada par completo vale um. */
function qualitativeProbabilityComponents(
  criteria: QualitativeProbabilityCriteria,
): number[] {
  const probabilities: Array<number | null | undefined> = [
    criteria.frequency,
    criteria.history,
    criteria.chancesOfHappening,
    criteria.medsImplemented,
  ];

  if (criteria.employeeCountGho && criteria.employeeCountTotal) {
    probabilities.push(
      percentageCheck(
        Number(criteria.employeeCountGho),
        Number(criteria.employeeCountTotal),
      ),
    );
  }

  if (criteria.minDurationEO && criteria.minDurationJT) {
    probabilities.push(
      percentageCheck(
        Number(criteria.minDurationEO),
        Number(criteria.minDurationJT),
      ),
    );
  }

  return probabilities.filter((value): value is number => !!value);
}

export function qualitativeProbabilityFromCriteria(
  criteria: QualitativeProbabilityCriteria,
): number | null {
  const finalProbabilities = qualitativeProbabilityComponents(criteria);
  if (!finalProbabilities.length) return null;

  const result =
    finalProbabilities.reduce<number>(
      (acc, curr) => Number(acc) + Number(curr),
      0,
    ) / finalProbabilities.length;
  if (!result) return null;
  return Math.ceil(result);
}

export type QualitativeProbabilityPreview = {
  probability: number;
  criteriaCount: number;
};

/** Mesma média do Create. N é o tamanho da lista que a média usa. */
export function qualitativeProbabilityPreview(
  criteria: QualitativeProbabilityCriteria,
): QualitativeProbabilityPreview | null {
  const criteriaCount = qualitativeProbabilityComponents(criteria).length;
  const probability = qualitativeProbabilityFromCriteria(criteria);
  if (!criteriaCount || probability == null) return null;
  return { probability, criteriaCount };
}

export function countSuggestionSignature(
  decision: CountSuggestionDecision,
): string {
  if (decision.kind === 'none') return 'none';
  return `${decision.kind}:${decision.probability}:${decision.criteria.employeeCountTotal}:${decision.criteria.employeeCountGho}:${decision.criteria.medsImplemented}:${decision.criteria.minDurationJT}`;
}

/**
 * A primeira observação da coluna não grava. Só uma mudança posterior da
 * assinatura, com a probabilidade ainda automática, dispara o save.
 */
export function countSuggestionEffectAction(
  previousSignature: string | null,
  decision: CountSuggestionDecision,
): 'baseline' | 'auto' | 'ignore' {
  const signature = countSuggestionSignature(decision);
  if (previousSignature == null) return 'baseline';
  if (previousSignature === signature) return 'ignore';
  if (decision.kind === 'auto') return 'auto';
  return 'ignore';
}

export function resolveCountSuggestion(params: {
  adopted?: QualitativeProbabilityCriteria | null;
  adoptedProbability?: number | null;
  currentTotal?: number | null;
  currentGho?: number | null;
  /**
   * Duração única conhecida, em minutos.
   * `undefined` = ainda carregando; `null` = nenhuma sugestão única.
   * Nos dois casos o snapshot adotado permanece.
   */
  currentJourneyMinutes?: number | null;
  isQuantity?: boolean;
}): CountSuggestionDecision {
  if (params.isQuantity || !params.adopted) return { kind: 'none' };

  const fromSaved = qualitativeProbabilityFromCriteria(params.adopted);
  if (fromSaved == null) return { kind: 'none' };
  if (params.currentTotal == null || params.currentGho == null)
    return { kind: 'none' };

  const savedTotal = params.adopted.employeeCountTotal ?? null;
  const savedGho = params.adopted.employeeCountGho ?? null;
  const savedMeds = params.adopted.medsImplemented ?? null;
  const savedJourney = params.adopted.minDurationJT ?? null;
  const nextJourney =
    params.currentJourneyMinutes != null
      ? params.currentJourneyMinutes
      : savedJourney;
  const countsSame =
    params.currentTotal === savedTotal && params.currentGho === savedGho;
  const journeySame = nextJourney === savedJourney;
  if (countsSame && journeySame) return { kind: 'none' };

  const nextCriteria: QualitativeProbabilityCriteria = {
    ...params.adopted,
    employeeCountTotal: params.currentTotal,
    employeeCountGho: params.currentGho,
    // A classificação ao vivo dos controles não substitui a escolha adotada.
    medsImplemented: savedMeds,
    minDurationJT: nextJourney,
  };
  const suggested = qualitativeProbabilityFromCriteria(nextCriteria);
  if (suggested == null || suggested === params.adoptedProbability)
    return { kind: 'none' };

  const stillAutomatic = params.adoptedProbability === fromSaved;
  return stillAutomatic
    ? { kind: 'auto', probability: suggested, criteria: nextCriteria }
    : { kind: 'hint', probability: suggested, criteria: nextCriteria };
}
