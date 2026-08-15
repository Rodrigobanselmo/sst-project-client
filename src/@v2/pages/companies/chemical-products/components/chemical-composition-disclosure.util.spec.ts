/**
 * Testes pontuais da declaração explícita de composição não individualizada.
 * Executar: npx tsx src/@v2/pages/companies/chemical-products/components/chemical-composition-disclosure.util.spec.ts
 */
import { emptyIngredient } from './chemical-composition-draft.util';
import {
  buildCreateFromFispqCompositionPayload,
  resolveFispqUndeclaredSubmitBlock,
  shouldSkipCompositionVersionOnEdit,
  UNINDIVIDUALIZED_COMPOSITION_BLOCKING_REASON,
} from './chemical-composition-disclosure.util';

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const acetona = {
  ...emptyIngredient(),
  chemicalName: 'Acetona',
  cas: '67-64-1',
  concentrationKind: 'EXACT' as const,
  exactPercent: 100,
};

const declared = buildCreateFromFispqCompositionPayload({
  undeclaredComposition: false,
  ingredients: [acetona],
});
assert(declared.compositionDisclosure === 'DECLARED', 'FISPQ with components stays DECLARED');
assert(declared.ingredients.length === 1, 'FISPQ with components keeps ingredients');
assert(declared.ingredients[0]?.chemicalName === 'Acetona', 'keeps chemical name');

assert(
  resolveFispqUndeclaredSubmitBlock({
    parseHadZeroUsableIngredients: true,
    undeclaredComposition: false,
    ingredients: [],
  }) === UNINDIVIDUALIZED_COMPOSITION_BLOCKING_REASON,
  'zero parse without declaration stays blocked',
);

const undeclared = buildCreateFromFispqCompositionPayload({
  undeclaredComposition: true,
  disclosureNote: 'Seção 3 sem componentes',
  ingredients: [emptyIngredient()],
});
assert(undeclared.compositionDisclosure === 'UNINDIVIDUALIZED', 'explicit declaration');
assert(undeclared.ingredients.length === 0, 'does not send empty/fake ingredient');
assert(
  undeclared.compositionDisclosureNote === 'Seção 3 sem componentes',
  'optional note is kept',
);
assert(
  resolveFispqUndeclaredSubmitBlock({
    parseHadZeroUsableIngredients: true,
    undeclaredComposition: true,
    ingredients: [],
  }) === null,
  'explicit UNINDIVIDUALIZED unblocks submit',
);

assert(
  shouldSkipCompositionVersionOnEdit({
    undeclaredComposition: true,
    ingredients: [],
  }) === true,
  'edit metadata of UNINDIVIDUALIZED does not create a new composition version',
);
assert(
  shouldSkipCompositionVersionOnEdit({
    undeclaredComposition: false,
    ingredients: [acetona],
  }) === false,
  'adding a component writes a DECLARED composition version',
);

assert(
  resolveFispqUndeclaredSubmitBlock({
    parseHadZeroUsableIngredients: false,
    undeclaredComposition: false,
    ingredients: [acetona],
  }) === null,
  'normal FISPQ with components is not blocked by undeclared rule',
);

console.log('chemical-composition-disclosure.util.spec.ts ok');
