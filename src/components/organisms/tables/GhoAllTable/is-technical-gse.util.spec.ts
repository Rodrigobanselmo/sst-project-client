/**
 * npx tsx src/components/organisms/tables/GhoAllTable/is-technical-gse.util.spec.ts
 */
import assert from 'node:assert/strict';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';

import { filterTechnicalGses, isTechnicalGse } from './is-technical-gse.util';

assert.equal(isTechnicalGse({ type: undefined }), true);
assert.equal(isTechnicalGse({ type: null as any }), true);
assert.equal(isTechnicalGse({ type: HomoTypeEnum.GSE }), true);
assert.equal(isTechnicalGse({ type: HomoTypeEnum.ENVIRONMENT }), false);
assert.equal(isTechnicalGse({ type: HomoTypeEnum.HIERARCHY }), false);
assert.equal(
  isTechnicalGse({
    type: undefined,
    characterization: { id: 'c1', name: 'Sala', type: 'GENERAL' },
  }),
  false,
);
assert.equal(
  isTechnicalGse({
    type: undefined,
    environment: { id: 'e1', name: 'Pátio', type: 'GENERAL' },
  }),
  false,
);

const filtered = filterTechnicalGses([
  { id: 'gse', type: null as any, name: 'GSE' },
  { id: 'env', type: HomoTypeEnum.ENVIRONMENT, name: 'Ambiente' },
  {
    id: 'char',
    type: undefined,
    name: 'Char',
    characterization: { id: 'c', name: 'c', type: 'GENERAL' },
  },
] as any);

assert.deepEqual(
  filtered.map((row) => row.id),
  ['gse'],
);

console.log('is-technical-gse.util.spec.ts ok');
