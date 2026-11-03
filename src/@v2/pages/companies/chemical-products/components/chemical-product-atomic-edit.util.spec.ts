import assert from 'node:assert/strict';
import {
  buildChemicalProductAtomicEdit,
  CHEMICAL_INVENTORY_DECLARATION_HELP,
} from './chemical-product-atomic-edit.util';
import {
  isSstMutationCancelled,
  SstMutationCancelledError,
} from '@v2/features/sst-operational/mutation-decision';

const ingredient = {
  key: 'persisted-ingredient',
  chemicalName: 'Etanol',
  cas: '64-17-5',
  concentrationKind: 'RANGE' as const,
  minPercent: 10,
  maxPercent: 20,
  exactPercent: null,
  riskFactorId: 'risk-1',
};
const input = {
  tradeName: ' Produto revisado ',
  manufacturer: ' Fabricante ',
  isPureSubstance: false,
  undeclaredComposition: false,
  ingredients: [ingredient],
};
const original = structuredClone(input);
const body = buildChemicalProductAtomicEdit(input);
assert.equal(body.tradeName, 'Produto revisado');
assert.equal(body.manufacturer, 'Fabricante');
assert.equal(body.composition?.sourceType, 'MANUAL');
assert.equal(body.composition?.compositionDisclosure, 'DECLARED');
assert.deepEqual(body.composition?.ingredients, [
  {
    chemicalName: 'Etanol',
    cas: '64-17-5',
    concentrationKind: 'RANGE',
    minPercent: 10,
    maxPercent: 20,
    exactPercent: null,
    riskFactorId: 'risk-1',
    sortOrder: 0,
  },
]);
assert.deepEqual(
  input,
  original,
  'Building a command cannot discard or mutate the local draft',
);
assert.equal(
  buildChemicalProductAtomicEdit({ ...input, isPureSubstance: true })
    .composition?.sourceType,
  'PURE',
);
const identityOnly = buildChemicalProductAtomicEdit({
  ...input,
  manufacturer: ' ',
  undeclaredComposition: true,
  ingredients: [],
});
assert.equal(identityOnly.manufacturer, null);
assert.equal(
  'composition' in identityOnly,
  false,
  'An undeclared composition remains preserved rather than becoming an empty declared version',
);
assert.equal(
  'effectiveFrom' in body,
  false,
  'Inventory authoring does not introduce an eSocial period',
);
assert.match(
  CHEMICAL_INVENTORY_DECLARATION_HELP,
  /não aplica fatores aos riscos/,
);
assert.equal(isSstMutationCancelled(new SstMutationCancelledError()), true);
assert.equal(isSstMutationCancelled(new Error('Falha de rede')), false);
assert.equal(
  isSstMutationCancelled({
    response: { status: 400, data: { message: 'Composição inválida' } },
  }),
  false,
);
assert.equal(isSstMutationCancelled(null), false);
console.log('chemical-product-atomic-edit.util.spec.ts OK');
