import assert from 'node:assert/strict';

import {
  formatInventoryGseDocumentLabel,
  formatInventoryGsePersistedName,
  isHumanInventoryGseNameOverride,
  resolveInventoryGsePersistedName,
} from './inventory-gse-name';

assert.equal(
  formatInventoryGsePersistedName({
    sourceCode: '10009',
    sourceName: 'CALDEIRA',
  }),
  'GSE 10009 — Caldeira',
);
assert.equal(
  formatInventoryGsePersistedName({
    sourceCode: '1014',
    sourceName: 'MIXER',
  }),
  'GSE 1014 — Mixer',
);
assert.equal(
  formatInventoryGseDocumentLabel({
    sourceLabel: 'GHE 10009',
    sourceCode: '10009',
    sourceName: 'CALDEIRA',
  }),
  'GHE 10009 — CALDEIRA',
);

const computed = formatInventoryGsePersistedName({
  sourceCode: '10009',
  sourceName: 'CALDEIRA',
});
assert.equal(isHumanInventoryGseNameOverride('', computed), false);
assert.equal(isHumanInventoryGseNameOverride(computed, computed), false);
assert.equal(
  isHumanInventoryGseNameOverride('Caldeira Atlas', computed),
  true,
);
assert.equal(
  resolveInventoryGsePersistedName({
    sourceCode: '10009',
    sourceName: 'CALDEIRA',
    appliedName: '',
  }),
  'GSE 10009 — Caldeira',
);

console.log('inventory-gse-name.spec.ts ok');
