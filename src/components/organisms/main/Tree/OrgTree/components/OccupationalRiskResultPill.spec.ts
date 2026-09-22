/**
 * Executar:
 * npx tsx src/components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pillSource = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill.tsx',
  'utf8',
);
const matrixEq = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolGSEView/Row/RiskBox/MatrixEquation.tsx',
  'utf8',
);
const rowV2 = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/RowColumns/index.tsx',
  'utf8',
);
const rowV1 = readFileSync(
  'src/components/organisms/main/Tree/OrgTree/components/RiskTool/components/SideRowTable/components/RowColumns/index.tsx',
  'utf8',
);
const stag = readFileSync('src/components/atoms/STag/index.tsx', 'utf8');

assert.ok(pillSource.includes('OCCUPATIONAL_RISK_RESULT_PILL_MIN_WIDTH = 108'));
assert.ok(pillSource.includes('alignSelfStart'));
assert.ok(pillSource.includes("alignSelf: alignSelfStart ? 'start'"));
assert.ok(pillSource.includes('height: 24'));
assert.ok(pillSource.includes('maxHeight: 24'));
assert.ok(pillSource.includes("whiteSpace: 'nowrap'"));
assert.equal(pillSource.includes('textOverflow'), false);
assert.equal(pillSource.includes("'...'"), false);

assert.ok(matrixEq.includes("from 'components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill'"));
assert.ok(rowV2.includes("from 'components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill'"));
assert.ok(rowV1.includes("from 'components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill'"));
assert.ok(rowV2.includes('alignSelfStart'));
assert.ok(rowV1.includes('alignSelfStart'));

assert.equal(rowV2.includes("alignSelf: 'center'"), false);
assert.equal(rowV2.includes("maxHeight: 'none'"), false);
assert.equal(rowV1.includes("alignSelf: 'center'"), false);

assert.equal(stag.includes("fontSize: chipColors ? '11px'"), false);
assert.ok(stag.includes("fontSize: '14px'"));

console.log('OccupationalRiskResultPill.spec.ts OK');
