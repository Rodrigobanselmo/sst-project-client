/**
 * Resets do PGR + tag Tipo de Modelos de Formulário.
 * npx tsx src/configs/theme/pgr-reset-form-type-opt-in.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (rel: string) => readFileSync(resolve(rel), 'utf8');

const docTable = read('src/components/organisms/tables/DocTable/index.tsx');
assert.equal(docTable.includes('text="Reset teste"'), true);
assert.equal(docTable.includes('text="Reset oficial"'), true);
assert.equal(docTable.includes('icon={ReplayOutlined}'), true);
assert.equal(docTable.includes('handleResetUnofficialVersions'), true);
assert.equal(docTable.includes('handleResetOfficialSeries'), true);
assert.equal(docTable.includes('brandIdentityToolbarAddSx'), true);
assert.equal(docTable.includes('brandIdentityFillSx'), true);
assert.equal(docTable.includes('pgrResetOperationalSx'), true);
assert.equal(docTable.includes('iconColor="inherit"'), true);
assert.equal(docTable.includes('iconColor="grey.600"'), false);
assert.equal(docTable.includes('primary.identityOn'), true);
assert.equal(docTable.includes("'&&&:hover'"), true);
assert.equal(docTable.includes("'&&&:focus-visible'"), true);
assert.equal(docTable.includes("'&&&:active'"), true);
assert.equal(docTable.includes('MuiButton-outlinedPrimary:hover'), true);
assert.equal(docTable.includes('MuiButton-outlinedPrimary:focus-visible'), true);
assert.equal(docTable.includes('MuiButton-outlinedPrimary:active'), true);

const formModel = read(
  'src/@v2/components/organisms/STable/implementation/SFormModelTable/SFormModelTable.tsx',
);
assert.equal(formModel.includes('getFormModelTypeTagPresentation'), true);
assert.equal(formModel.includes("backgroundColor: 'grey.700'"), true);
assert.equal(formModel.includes("color: 'common.white'"), true);
assert.equal(formModel.includes("borderColor: 'grey.500'"), true);
assert.equal(formModel.includes("backgroundColor: 'grey.100'"), true);
assert.equal(formModel.includes("color: 'text.label'"), true);
assert.equal(formModel.includes('FormModelTypesMap[row.type].label'), true);
assert.equal(formModel.includes('primary.identityBackground'), false);

const tagDefault = read(
  'src/@v2/components/organisms/STable/addons/addons-rows/STagRow/STagRow.tsx',
);
assert.equal(tagDefault.includes("backgroundColor = 'grey.100'"), true);
assert.equal(tagDefault.includes("color = 'text.label'"), true);

const formApp = read(
  'src/@v2/components/organisms/STable/implementation/SFormApplicationTable/SFormApplicationTable.tsx',
);
assert.equal(formApp.includes('FormApplicationStatusMap[row.status].schema'), true);
assert.equal(formApp.includes('getFormModelTypeTagPresentation'), false);

console.log('pgr-reset-form-type-opt-in.spec.ts ok');
