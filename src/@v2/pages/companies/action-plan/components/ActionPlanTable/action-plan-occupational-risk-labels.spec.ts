/**
 * npx tsx src/@v2/pages/companies/action-plan/components/ActionPlanTable/action-plan-occupational-risk-labels.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const columnMap = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/implementation/SActionPlanTable/maps/action-plan-column-map.ts',
  ),
  'utf8',
);
const table = readFileSync(
  resolve(
    'src/@v2/pages/companies/action-plan/components/ActionPlanTable/ActionPlanTable.tsx',
  ),
  'utf8',
);
const filter = readFileSync(
  resolve(
    'src/@v2/pages/companies/action-plan/components/ActionPlanTable/components/ActionPlanTableFilter/components/ActionPlanTableFilterLevel.tsx',
  ),
  'utf8',
);
const translation = readFileSync(
  resolve('src/@v2/models/security/translations/ocupational-risk-level.translation.ts'),
  'utf8',
);

assert.match(columnMap, /\[ActionPlanColumnsEnum\.LEVEL\]: \{ label: 'Risco ocupacional' \}/);
assert.match(table, /leftLabel: 'Risco ocupacional'/);
assert.match(filter, /label="Risco ocupacional"/);
assert.doesNotMatch(columnMap, /label: 'Nível'/);
assert.doesNotMatch(table, /leftLabel: 'Nível'/);

assert.match(translation, /\[0\]: '-'/);
assert.match(translation, /\[1\]: 'Muito Baixo'/);
assert.match(translation, /\[2\]: 'Baixo'/);
assert.match(translation, /\[3\]: 'Moderado'/);
assert.match(translation, /\[4\]: 'Alto'/);
assert.match(translation, /\[5\]: 'Muito Alto'/);
assert.match(translation, /\[6\]: 'Interromper'/);
assert.doesNotMatch(translation, /\[3\]: 'Médio'/);

const tag = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/implementation/SActionPlanTable/components/OccupationalRiskTag/OccupationalRiskTag.tsx',
  ),
  'utf8',
);
assert.match(tag, /\[3\]: \{\s*bgcolor: 'primary\.main',\s*color: 'text\.dark',/);
assert.match(tag, /\[2\]: \{\s*bgcolor: 'scale\.mediumLow',\s*color: 'white',/);
assert.match(tag, /\[4\]: \{\s*bgcolor: 'scale\.mediumHigh',\s*color: 'white',/);

console.log('action-plan occupational risk labels ok');
