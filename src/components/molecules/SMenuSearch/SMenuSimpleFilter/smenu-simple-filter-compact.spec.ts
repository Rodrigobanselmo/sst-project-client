/**
 * Executar:
 * npx tsx src/components/molecules/SMenuSearch/SMenuSimpleFilter/smenu-simple-filter-compact.spec.ts
 */
import assert from 'node:assert/strict';

import { SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX } from './smenu-simple-filter-compact.styles';

assert.equal(SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX.whiteSpace, 'nowrap');
assert.equal(SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX.lineHeight, 1.2);
assert.equal(SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX.height, 22);
assert.equal(SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX.maxHeight, 22);
assert.equal(SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX.overflow, 'hidden');
assert.equal(SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX.textOverflow, 'ellipsis');
assert.ok(SMENU_SIMPLE_FILTER_COMPACT_CHIP_SX.maxWidth >= 140);

console.log('smenu-simple-filter-compact.spec.ts ok');
