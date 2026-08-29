/**
 * Opt-in de pílula: Filter/Export não mudam default; só consomem tableButtonProps.
 * npx tsx src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/table-utility-opt-in.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const filter = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton.tsx',
  ),
  'utf8',
);
const filterTypes = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton.types.ts',
  ),
  'utf8',
);
const exp = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton.tsx',
  ),
  'utf8',
);
const add = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton.tsx',
  ),
  'utf8',
);

assert.equal(filterTypes.includes('tableButtonProps?:'), true);
assert.equal(filter.includes('{...tableButtonProps}'), true);
assert.equal(filter.includes("text={text ?? 'Fitros'}"), true);
assert.equal(filter.includes('identityFill'), false);

assert.equal(exp.includes('color="info"'), true);
assert.equal(exp.includes('{...tableButtonProps}'), true);
assert.equal(exp.includes('identityFill'), false);

assert.equal(add.includes('identityFill = false'), true);

console.log('table-utility-opt-in.spec.ts ok');
