export type ConcentrationKind =
  | 'EXACT'
  | 'RANGE'
  | 'CONFIDENTIAL'
  | 'NOT_INFORMED'
  | 'UNDETERMINED';

export type IngredientDraft = {
  key: string;
  chemicalName: string;
  cas: string;
  concentrationKind: ConcentrationKind;
  exactPercent?: number | null;
  minPercent?: number | null;
  maxPercent?: number | null;
  riskFactorId?: string | null;
  riskOption?: {
    id: string;
    name: string;
    cas: string | null;
    system: boolean;
    companyId: string;
    type: string;
  } | null;
  matchStatus?: 'MATCHED' | 'NO_MATCH' | 'NO_CAS' | null;
  pending?: boolean;
  pendingReason?: string | null;
};

export const emptyIngredient = (): IngredientDraft => ({
  key: `${Date.now()}-${Math.random()}`,
  chemicalName: '',
  cas: '',
  concentrationKind: 'EXACT',
  exactPercent: undefined,
  minPercent: undefined,
  maxPercent: undefined,
  riskFactorId: null,
  riskOption: null,
});

export function composeExactSum(ingredients: IngredientDraft[]): number {
  return ingredients.reduce((sum, item) => {
    if (
      item.concentrationKind === 'EXACT' &&
      typeof item.exactPercent === 'number' &&
      Number.isFinite(item.exactPercent)
    ) {
      return sum + item.exactPercent;
    }
    return sum;
  }, 0);
}

export function canAddExactComponent(exactSum: number): boolean {
  return exactSum < 100 - 1e-9;
}

/** Clear incompatible percent fields when concentration kind changes. */
export function clearIncompatibleConcentrationFields(
  kind: ConcentrationKind,
  patch: Partial<IngredientDraft> = {},
): Partial<IngredientDraft> {
  if (kind === 'EXACT') {
    return {
      ...patch,
      concentrationKind: kind,
      minPercent: null,
      maxPercent: null,
    };
  }
  if (kind === 'RANGE') {
    return {
      ...patch,
      concentrationKind: kind,
      exactPercent: null,
    };
  }
  return {
    ...patch,
    concentrationKind: kind,
    exactPercent: null,
    minPercent: null,
    maxPercent: null,
  };
}

export function ingredientRowErrors(ingredient: IngredientDraft): string[] {
  const errors: string[] = [];
  if (!ingredient.chemicalName.trim()) {
    errors.push('Informe o nome químico.');
  }
  if (ingredient.concentrationKind === 'EXACT') {
    if (
      ingredient.exactPercent == null ||
      !Number.isFinite(ingredient.exactPercent)
    ) {
      errors.push('Informe o percentual exato.');
    }
  }
  if (ingredient.concentrationKind === 'RANGE') {
    if (
      ingredient.minPercent == null ||
      ingredient.maxPercent == null ||
      !Number.isFinite(ingredient.minPercent) ||
      !Number.isFinite(ingredient.maxPercent)
    ) {
      errors.push('Informe mínimo e máximo da faixa.');
    }
  }
  return errors;
}

export function compositionClientErrors(ingredients: IngredientDraft[]): {
  exactSum: number;
  remaining: number;
  rowErrors: Record<string, string[]>;
  globalErrors: string[];
  incomplete: boolean;
  exceeds: boolean;
} {
  const exactSum = composeExactSum(ingredients);
  const rowErrors: Record<string, string[]> = {};
  ingredients.forEach((ingredient) => {
    const errors = ingredientRowErrors(ingredient);
    if (errors.length) rowErrors[ingredient.key] = errors;
  });

  const globalErrors: string[] = [];
  const exceeds = exactSum > 100 + 1e-9;
  if (exceeds) {
    globalErrors.push(
      `Soma das concentrações exatas (${exactSum.toFixed(2)}%) acima de 100%.`,
    );
  }

  return {
    exactSum,
    remaining: Math.max(0, 100 - exactSum),
    rowErrors,
    globalErrors,
    incomplete: exactSum < 100 - 1e-9,
    exceeds,
  };
}
