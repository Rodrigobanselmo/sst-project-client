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
  workspaceIds?: string[];
  ghoEmployeeCount?: number;
  allWorkspaces?: boolean;
};

export type CountSuggestionDecision =
  | { kind: 'none' }
  | { kind: 'auto'; probability: number; criteria: QualitativeProbabilityCriteria }
  | { kind: 'hint'; probability: number; criteria: QualitativeProbabilityCriteria };

export const percentageCheck = (value: number, limit: number) => {
  if (!value || !limit) return 0;

  const stage = value / limit;
  if (stage < 0.1) return 1;
  if (stage < 0.25) return 2;
  if (stage < 0.5) return 3;
  if (stage < 1) return 4;
  return 5;
};

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

export function qualitativeProbabilityFromCriteria(
  criteria: QualitativeProbabilityCriteria,
): number | null {
  const probabilities = [
    criteria.frequency,
    criteria.history,
    criteria.chancesOfHappening,
    criteria.medsImplemented,
  ];

  if (criteria.employeeCountGho && criteria.employeeCountTotal) {
    probabilities.push(
      percentageCheck(Number(criteria.employeeCountGho), Number(criteria.employeeCountTotal)),
    );
  }

  if (criteria.minDurationEO && criteria.minDurationJT) {
    probabilities.push(percentageCheck(Number(criteria.minDurationEO), Number(criteria.minDurationJT)));
  }

  const finalProbabilities = probabilities.filter((value) => value);
  if (!finalProbabilities.length) return null;

  const result =
    finalProbabilities.reduce<number>((acc, curr) => Number(acc) + Number(curr), 0) /
    finalProbabilities.length;
  if (!result) return null;
  return Math.ceil(result);
}

export function countSuggestionSignature(decision: CountSuggestionDecision): string {
  if (decision.kind === 'none') return 'none';
  return `${decision.kind}:${decision.probability}:${decision.criteria.employeeCountTotal}:${decision.criteria.employeeCountGho}`;
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
  isQuantity?: boolean;
}): CountSuggestionDecision {
  if (params.isQuantity || !params.adopted) return { kind: 'none' };

  const fromSaved = qualitativeProbabilityFromCriteria(params.adopted);
  if (fromSaved == null) return { kind: 'none' };
  if (params.currentTotal == null || params.currentGho == null) return { kind: 'none' };

  const savedTotal = params.adopted.employeeCountTotal ?? null;
  const savedGho = params.adopted.employeeCountGho ?? null;
  if (params.currentTotal === savedTotal && params.currentGho === savedGho) return { kind: 'none' };

  const nextCriteria: QualitativeProbabilityCriteria = {
    ...params.adopted,
    employeeCountTotal: params.currentTotal,
    employeeCountGho: params.currentGho,
  };
  const suggested = qualitativeProbabilityFromCriteria(nextCriteria);
  if (suggested == null || suggested === params.adoptedProbability) return { kind: 'none' };

  const stillAutomatic = params.adoptedProbability === fromSaved;
  return stillAutomatic
    ? { kind: 'auto', probability: suggested, criteria: nextCriteria }
    : { kind: 'hint', probability: suggested, criteria: nextCriteria };
}
