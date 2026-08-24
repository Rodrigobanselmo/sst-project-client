/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/risk-catalog-bulk-add/resolve-risk-catalog-multi-select.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  excludeAlreadyLinkedIds,
  extractSelectedCatalogIds,
  resolveNewCatalogIds,
} from './resolve-risk-catalog-multi-select.util';

assert.deepEqual(extractSelectedCatalogIds(['a', 'b', 'a', '']), ['a', 'b']);
assert.deepEqual(extractSelectedCatalogIds({ id: 'rec-1' }), ['rec-1']);
assert.deepEqual(extractSelectedCatalogIds([{ id: '1' }, { id: '2' }]), [
  '1',
  '2',
]);
assert.deepEqual(extractSelectedCatalogIds(null), []);
assert.deepEqual(extractSelectedCatalogIds([]), []);

assert.deepEqual(
  excludeAlreadyLinkedIds(['a', 'b', 'c'], ['b', 'd']),
  ['a', 'c'],
);

assert.deepEqual(
  resolveNewCatalogIds(['gs-1', 'gs-2', 'gs-1'], ['gs-1']),
  ['gs-2'],
);

assert.deepEqual(
  resolveNewCatalogIds({ id: 'adm-1' }, ['adm-1']),
  [],
);

assert.deepEqual(
  resolveNewCatalogIds(
    ['eng-1', 'eng-2'],
    ['eng-1'],
  ),
  ['eng-2'],
);

console.log('resolve-risk-catalog-multi-select.util.spec.ts ok');
