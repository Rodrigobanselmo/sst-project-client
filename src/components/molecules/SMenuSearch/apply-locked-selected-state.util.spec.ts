/**
 * Executar:
 * npx tsx src/components/molecules/SMenuSearch/apply-locked-selected-state.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  applyLockedSelectedState,
  optionValueIsSelected,
  sortByOptionOrder,
} from './apply-locked-selected-state.util';

const options = [
  { id: 'a', name: 'Alpha' },
  { id: 'b', name: 'Beta' },
  { id: 'c', name: 'Gama' },
];

assert.equal(optionValueIsSelected('b', ['b']), true);
assert.equal(optionValueIsSelected(1, ['1']), true);
assert.equal(optionValueIsSelected('z', ['b']), false);
assert.equal(optionValueIsSelected('b', []), false);

assert.deepEqual(
  applyLockedSelectedState(options, ['c', 'a'], 'id').map((item) => item.id),
  ['a', 'c', 'b'],
);

const locked = applyLockedSelectedState(options, ['c'], 'id', {
  lockSelected: true,
});
assert.equal(locked[0]?.id, 'c');
assert.equal(locked[0]?.checked, true);
assert.equal(locked[0]?.locked, true);
assert.equal(locked[1]?.locked, undefined);

const preserved = applyLockedSelectedState(options, ['c'], 'id', {
  lockSelected: true,
  preserveOptionOrder: true,
});
assert.deepEqual(
  preserved.map((item) => item.id),
  ['a', 'b', 'c'],
);
assert.equal(preserved[2]?.locked, true);

assert.deepEqual(
  sortByOptionOrder(
    [{ id: 'c' }, { id: 'a' }],
    options,
    'id',
  ).map((item) => item.id),
  ['a', 'c'],
);

console.log('apply-locked-selected-state.util.spec.ts ok');
