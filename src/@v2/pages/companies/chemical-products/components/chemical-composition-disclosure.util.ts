import type {
  ChemicalCompositionDisclosure,
  ChemicalIngredientPayload,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';

import { hasUsableExtractedIngredients } from './chemical-fispq-link-composition.util';
import type { IngredientDraft } from './chemical-composition-draft.util';

export const UNINDIVIDUALIZED_COMPOSITION_LABEL =
  'Composição não individualizada na FISPQ';

export const UNINDIVIDUALIZED_COMPOSITION_CHECKBOX_LABEL =
  'FISPQ não individualiza a composição química';

export const UNINDIVIDUALIZED_COMPOSITION_HELPER =
  'Use somente quando a FISPQ realmente não fornecer componentes individualizáveis. Isso não significa ausência de risco, não cria fator de risco e o produto continuará disponível para triagem.';

export const UNINDIVIDUALIZED_COMPOSITION_BLOCKING_REASON =
  'Declare se a FISPQ não individualiza a composição química, ou adicione componentes.';

export function isUnindividualizedDisclosure(
  value: ChemicalCompositionDisclosure | string | null | undefined,
): boolean {
  return value === 'UNINDIVIDUALIZED';
}

export function toIngredientPayload(
  rows: IngredientDraft[],
): ChemicalIngredientPayload[] {
  return rows.map((ingredient, index) => ({
    chemicalName: ingredient.chemicalName,
    cas: ingredient.cas || null,
    concentrationKind: ingredient.concentrationKind,
    exactPercent: ingredient.exactPercent ?? null,
    minPercent: ingredient.minPercent ?? null,
    maxPercent: ingredient.maxPercent ?? null,
    riskFactorId: ingredient.riskFactorId || null,
    sortOrder: index,
  }));
}

export function buildCreateFromFispqCompositionPayload(params: {
  undeclaredComposition: boolean;
  disclosureNote?: string;
  ingredients: IngredientDraft[];
}): {
  ingredients: ChemicalIngredientPayload[];
  compositionDisclosure: ChemicalCompositionDisclosure;
  compositionDisclosureNote: string | null;
} {
  const note = params.disclosureNote?.trim() || null;
  if (params.undeclaredComposition) {
    return {
      ingredients: [],
      compositionDisclosure: 'UNINDIVIDUALIZED',
      compositionDisclosureNote: note,
    };
  }
  return {
    ingredients: toIngredientPayload(params.ingredients),
    compositionDisclosure: 'DECLARED',
    compositionDisclosureNote: null,
  };
}

export function resolveFispqUndeclaredSubmitBlock(params: {
  parseHadZeroUsableIngredients: boolean;
  undeclaredComposition: boolean;
  ingredients: IngredientDraft[];
}): string | null {
  if (!params.parseHadZeroUsableIngredients) return null;
  if (params.undeclaredComposition) return null;
  if (params.ingredients.some((item) => item.chemicalName.trim())) return null;
  return UNINDIVIDUALIZED_COMPOSITION_BLOCKING_REASON;
}

export function shouldSkipCompositionVersionOnEdit(params: {
  undeclaredComposition: boolean;
  ingredients: IngredientDraft[];
}): boolean {
  return params.undeclaredComposition && params.ingredients.length === 0;
}

export { hasUsableExtractedIngredients };
