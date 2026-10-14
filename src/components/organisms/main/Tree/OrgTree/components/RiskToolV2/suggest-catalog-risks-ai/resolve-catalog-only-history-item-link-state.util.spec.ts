import assert from 'node:assert/strict';

import {
  filterCatalogOnlyHistoryIdsForLink,
  resolveCatalogOnlyHistoryItemLinkState,
} from './resolve-catalog-only-history-item-link-state.util';

const catalogIds = new Set(['a', 'b', 'c']);
const existingDirectRiskIds = new Set(['b']);

assert.equal(
  resolveCatalogOnlyHistoryItemLinkState({
    item: { riskId: 'a' },
    catalogIds,
    existingDirectRiskIds,
  }),
  'selectable',
);
assert.equal(
  resolveCatalogOnlyHistoryItemLinkState({
    item: { riskId: 'b' },
    catalogIds,
    existingDirectRiskIds,
  }),
  'already_linked',
);
assert.equal(
  resolveCatalogOnlyHistoryItemLinkState({
    item: { riskId: 'ghost' },
    catalogIds,
    existingDirectRiskIds,
  }),
  'unavailable',
);

const filtered = filterCatalogOnlyHistoryIdsForLink({
  selectedRiskIds: ['a', 'a', 'b', 'ghost', 'c'],
  catalogIds,
  existingDirectRiskIds,
});
assert.deepEqual(filtered.linkableIds, ['a', 'c']);
assert.equal(filtered.blockedAlreadyLinked, 1);
assert.equal(filtered.blockedUnavailable, 1);

console.log('resolve-catalog-only-history-item-link-state.util.spec.ts OK');
