import assert from 'node:assert/strict';

import { filterCatalogOnlyAiSuggestions } from './filter-catalog-only-ai-suggestions.util';

const base = (id: string) =>
  ({
    id,
    name: id,
    type: 'FIS',
    explanation: 'ok',
    generateSource: '',
    probability: 0,
    recommendedEngineeringMeasures: [],
    recommendedAdministrativeMeasures: [],
    existingEngineeringMeasures: [],
    existingAdministrativeMeasures: [],
    confidence: 1,
  }) as const;

const catalogIds = new Set(['a', 'b', 'c']);

const emptyApi = filterCatalogOnlyAiSuggestions({
  incoming: [],
  catalogIds,
  existingDirectRiskIds: new Set(),
});
assert.equal(emptyApi.apiReturnedCount, 0);
assert.equal(emptyApi.accepted.length, 0);

const withCacheIndependent = filterCatalogOnlyAiSuggestions({
  incoming: [base('a'), base('b')],
  catalogIds,
  existingDirectRiskIds: new Set(),
});
assert.deepEqual(
  withCacheIndependent.accepted.map((r) => r.id),
  ['a', 'b'],
);

const invalidAndLinked = filterCatalogOnlyAiSuggestions({
  incoming: [base('a'), base('ghost'), base('b')],
  catalogIds,
  existingDirectRiskIds: new Set(['b']),
});
assert.deepEqual(
  invalidAndLinked.accepted.map((r) => r.id),
  ['a'],
);
assert.equal(invalidAndLinked.discardedInvalidCatalog, 1);
assert.equal(invalidAndLinked.discardedAlreadyLinked, 1);
assert.equal(invalidAndLinked.apiReturnedCount, 3);

// Herdado no setor (não está em existingDirectRiskIds) permanece elegível
const inheritedNotExcluded = filterCatalogOnlyAiSuggestions({
  incoming: [base('c')],
  catalogIds,
  existingDirectRiskIds: new Set(),
});
assert.deepEqual(
  inheritedNotExcluded.accepted.map((r) => r.id),
  ['c'],
);

console.log('filter-catalog-only-ai-suggestions.util.spec.ts OK');
