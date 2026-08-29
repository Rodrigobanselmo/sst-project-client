/**
 * npx tsx src/configs/theme/characterization-toolbar-polish.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (rel: string) =>
  readFileSync(resolve(process.cwd(), rel), 'utf8');

const selectRisk = read(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolTopButtons/SelectRisk/index.tsx',
);
const ghosTable = read('src/components/organisms/tables/GhosTable/GhosTable.tsx');
const characterizationTable = read(
  'src/@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable.tsx',
);
const examsTable = read(
  'src/components/organisms/tables/ExamsRiskTable/ExamsRiskTable.tsx',
);
const countCell = read(
  'src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationQuickCountCell.tsx',
);
const risksCell = read(
  'src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationRisksQuickCell.tsx',
);

assert.match(selectRisk, /isViewTypeGroup && !selectedGho/);
assert.match(selectRisk, /Selecione uma entidade para adicionar riscos/);
assert.match(selectRisk, /InfoOutlined/);
assert.equal(
  selectRisk.includes('disabled={isViewTypeGroup && !selectedGho}'),
  false,
);

assert.match(ghosTable, /brandIdentityGlyphDarkSx/);
assert.match(ghosTable, /sx=\{isDark \? brandIdentityGlyphDarkSx : undefined\}/);

assert.match(characterizationTable, /brandIdentityGlyphDarkSx/);
assert.match(
  characterizationTable,
  /sx: isDark \? brandIdentityGlyphDarkSx : undefined/,
);

const pcmsoIndex = examsTable.indexOf('Padrões de PCMSO');
const pendingIndex = examsTable.indexOf('Mostrar só pendências do vínculo');
assert.ok(pcmsoIndex > 0);
assert.ok(pendingIndex > pcmsoIndex);
assert.match(examsTable, /brandIdentityToolbarAddSx/);
assert.match(examsTable, /tableUtilityPillButtonProps/);

assert.match(countCell, /brandIdentityQuantityColor/);
assert.match(risksCell, /brandIdentityQuantityColor/);
assert.equal(
  countCell.includes("color: disabled ? 'text.disabled' : 'primary.main'"),
  false,
);
assert.match(risksCell, /color: brandIdentityQuantityColor/);
assert.match(risksCell, /brandIdentityQuantityColor/);
assert.equal(risksCell.includes("'primary.main'"), false);

console.log('characterization-toolbar-polish.spec.ts ok');
