/**
 * npx tsx src/components/atoms/STable/components/STableSearch/s-table-add-button.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const searchSource = readFileSync(
  resolve('src/components/atoms/STable/components/STableSearch/index.tsx'),
  'utf8',
);

assert.equal(
  searchSource.includes(
    '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton',
  ),
  true,
);
assert.equal(searchSource.includes("text={text}"), true);
assert.equal(searchSource.includes("'Adicionar'"), true);
assert.equal(searchSource.includes('color: \'common.white\''), false);
assert.equal(searchSource.includes('minWidth: sm ? 30'), false);

const v2Source = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton.tsx',
  ),
  'utf8',
);
assert.equal(v2Source.includes("text={text ?? 'Adicionar'}"), true);
assert.equal(v2Source.includes('color="success"'), true);

const smallTitle = readFileSync(
  resolve(
    'src/components/atoms/STable/components/STableSmallTitle/STableSmallTitle.tsx',
  ),
  'utf8',
);
assert.equal(smallTitle.includes('V2STableAddButton'), true);
assert.equal(smallTitle.includes('text="Adicionar"'), true);
assert.equal(smallTitle.includes("text={'adcionar'}"), false);
assert.equal(smallTitle.includes('STagButton'), false);

console.log('s-table-add-button.spec.ts ok');
