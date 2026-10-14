import assert from 'node:assert/strict';

import { filterCatalogOnlyAiSuggestions } from './filter-catalog-only-ai-suggestions.util';

const base = (id: string, explanation = 'ok') =>
  ({
    id,
    name: id,
    type: 'FIS',
    explanation,
    generateSource: '',
    probability: 0,
    recommendedEngineeringMeasures: [],
    recommendedAdministrativeMeasures: [],
    existingEngineeringMeasures: [],
    existingAdministrativeMeasures: [],
    confidence: 1,
  }) as const;

const catalogIds = new Set(['a', 'b', 'c', 'd']);

// A — somente novos
const onlyNew = filterCatalogOnlyAiSuggestions({
  incoming: [base('a'), base('b')],
  incomingAlreadyLinked: [],
  catalogIds,
  existingDirectRiskIds: new Set(),
});
assert.deepEqual(
  onlyNew.accepted.map((r) => r.id),
  ['a', 'b'],
);
assert.equal(onlyNew.recognizedAlreadyLinked.length, 0);

// B — somente já vinculados
const onlyLinked = filterCatalogOnlyAiSuggestions({
  incoming: [],
  incomingAlreadyLinked: [base('c', 'já no posto')],
  catalogIds,
  existingDirectRiskIds: new Set(['c']),
});
assert.equal(onlyLinked.accepted.length, 0);
assert.deepEqual(
  onlyLinked.recognizedAlreadyLinked.map((r) => r.id),
  ['c'],
);
assert.equal(onlyLinked.recognizedAlreadyLinked[0].explanation, 'já no posto');

// C — misto
const mixed = filterCatalogOnlyAiSuggestions({
  incoming: [base('a')],
  incomingAlreadyLinked: [base('c')],
  catalogIds,
  existingDirectRiskIds: new Set(['c']),
});
assert.deepEqual(
  mixed.accepted.map((r) => r.id),
  ['a'],
);
assert.deepEqual(
  mixed.recognizedAlreadyLinked.map((r) => r.id),
  ['c'],
);

// D — vazio
const emptyApi = filterCatalogOnlyAiSuggestions({
  incoming: [],
  catalogIds,
  existingDirectRiskIds: new Set(),
});
assert.equal(emptyApi.apiReturnedNewCount, 0);
assert.equal(emptyApi.accepted.length, 0);
assert.equal(emptyApi.recognizedAlreadyLinked.length, 0);

// E — inválido / fora do catálogo
const invalid = filterCatalogOnlyAiSuggestions({
  incoming: [base('a'), base('ghost')],
  incomingAlreadyLinked: [base('ghost2')],
  catalogIds,
  existingDirectRiskIds: new Set(),
});
assert.deepEqual(
  invalid.accepted.map((r) => r.id),
  ['a'],
);
assert.equal(invalid.discardedInvalidCatalog, 2);

// F — duplicados
const dupes = filterCatalogOnlyAiSuggestions({
  incoming: [base('a'), base('a')],
  incomingAlreadyLinked: [base('c'), base('c')],
  catalogIds,
  existingDirectRiskIds: new Set(['c']),
});
assert.deepEqual(
  dupes.accepted.map((r) => r.id),
  ['a'],
);
assert.deepEqual(
  dupes.recognizedAlreadyLinked.map((r) => r.id),
  ['c'],
);

// Novo que o client ainda vê como vinculado → seção já vinculados
const newButLinked = filterCatalogOnlyAiSuggestions({
  incoming: [base('b', 'reconhecido de novo')],
  catalogIds,
  existingDirectRiskIds: new Set(['b']),
});
assert.equal(newButLinked.accepted.length, 0);
assert.deepEqual(
  newButLinked.recognizedAlreadyLinked.map((r) => r.id),
  ['b'],
);
assert.equal(newButLinked.discardedAlreadyLinkedFromNew, 1);

// Herdado (não em existingDirectRiskIds) permanece elegível como novo
const inheritedNotExcluded = filterCatalogOnlyAiSuggestions({
  incoming: [base('d')],
  catalogIds,
  existingDirectRiskIds: new Set(),
});
assert.deepEqual(
  inheritedNotExcluded.accepted.map((r) => r.id),
  ['d'],
);

console.log('filter-catalog-only-ai-suggestions.util.spec.ts OK');
