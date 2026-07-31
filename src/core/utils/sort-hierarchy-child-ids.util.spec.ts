/**
 * Executar: npx tsx src/core/utils/sort-hierarchy-child-ids.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  sortHierarchyChildIds,
  sortIdsByLabel,
} from './sort-hierarchy-child-ids.util';

const names: Record<string, string> = {
  b: 'Bravo',
  a: 'Alpha',
  c: 'Charlie',
};

const frozen = Object.freeze(['b', 'a', 'c']);

assert.deepEqual(
  sortHierarchyChildIds(frozen, (id) => names[id] || ''),
  ['a', 'b', 'c'],
);
assert.deepEqual(frozen, ['b', 'a', 'c'], 'input must stay untouched');

assert.deepEqual(sortHierarchyChildIds(undefined, () => ''), []);
assert.deepEqual(sortHierarchyChildIds(null, () => ''), []);
assert.deepEqual(sortHierarchyChildIds([], () => ''), []);

assert.deepEqual(
  sortIdsByLabel(Object.freeze(['ws-2', 'ws-1']), (id) =>
    id === 'ws-1' ? 'A' : 'B',
  ),
  ['ws-1', 'ws-2'],
);

console.log('sort-hierarchy-child-ids.util.spec.ts: ok');
