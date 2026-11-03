import type { ChemicalCompositionMutation } from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import type { IngredientDraft } from './chemical-composition-draft.util';
import {
  shouldSkipCompositionVersionOnEdit,
  toIngredientPayload,
} from './chemical-composition-disclosure.util';

export const CHEMICAL_INVENTORY_DECLARATION_HELP =
  'Este cadastro organiza o levantamento químico. Ele não aplica fatores aos riscos nem altera avaliações ou envios do eSocial. A aplicação ao risco é feita na caracterização, com a decisão sobre o período quando necessária.';

/** One command preserves identity and active composition together on failure. */
export function buildChemicalProductAtomicEdit(params: {
  tradeName: string;
  manufacturer: string;
  isPureSubstance: boolean;
  undeclaredComposition: boolean;
  ingredients: IngredientDraft[];
}): {
  tradeName: string;
  manufacturer: string | null;
  composition?: ChemicalCompositionMutation;
} {
  return {
    tradeName: params.tradeName.trim(),
    manufacturer: params.manufacturer.trim() || null,
    ...(!shouldSkipCompositionVersionOnEdit(params) && {
      composition: {
        sourceType: params.isPureSubstance
          ? ('PURE' as const)
          : ('MANUAL' as const),
        compositionDisclosure: 'DECLARED' as const,
        ingredients: toIngredientPayload(params.ingredients),
      },
    }),
  };
}
