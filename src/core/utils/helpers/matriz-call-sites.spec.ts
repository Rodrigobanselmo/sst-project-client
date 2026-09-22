/**
 * Executar:
 * npx tsx src/core/utils/helpers/matriz-call-sites.spec.ts
 *
 * Garante o contrato de apresentação do RO no RiskTool:
 * - inerente: resolveDisplayedOccupationalRisk
 * - residual: resolveDisplayedResidualOccupationalRisk
 * - CUSTOM não recalcula via getMatrizRisk(S, P) nos call sites.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (relativePath: string) =>
  readFileSync(resolve(relativePath), 'utf8');

const riskToolRowColumns = read(
  'src/components/organisms/main/Tree/OrgTree/components/RiskTool/components/SideRowTable/components/RowColumns/index.tsx',
);
const riskToolV2RowColumns = read(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/SideRowTable/components/RowColumns/index.tsx',
);
const riskBox = read(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolGSEView/Row/RiskBox/index.tsx',
);
const matrixEquation = read(
  'src/components/organisms/main/Tree/OrgTree/components/RiskToolV2/components/RiskToolViews/RiskToolGSEView/Row/RiskBox/MatrixEquation.tsx',
);
const matrizHelper = read('src/core/utils/helpers/matriz.ts');
const upsertMut = read(
  'src/core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData/index.ts',
);
const iRiskData = read('src/core/interfaces/api/IRiskData.ts');

assert.match(
  matrizHelper,
  /getMatrizRisk = \(severity\?: number, probability\?: number\)/,
);
assert.match(
  matrizHelper,
  /resolveMatrixRiskLevel\(\s*severity\?: number,\s*probability\?: number/,
);
assert.match(matrizHelper, /resolveDisplayedOccupationalRisk/);
assert.match(matrizHelper, /resolveDisplayedResidualOccupationalRisk/);
assert.match(matrizHelper, /hasCustomMatrixSnapshot/);

assert.match(iRiskData, /matrixSource\?:/);
assert.match(iRiskData, /resolvedLabel\?:/);
assert.match(iRiskData, /residualLabel\?:/);

assert.match(upsertMut, /setQueriesData/);
assert.match(upsertMut, /\.\.\.item, \.\.\.resp/);

for (const [name, source] of [
  ['RiskTool RowColumns', riskToolRowColumns],
  ['RiskToolV2 RowColumns', riskToolV2RowColumns],
] as const) {
  assert.match(
    source,
    /resolveDisplayedOccupationalRisk\(\{/,
    `${name}: inherent RO must use resolveDisplayedOccupationalRisk`,
  );
  assert.match(
    source,
    /resolveDisplayedResidualOccupationalRisk\(\{/,
    `${name}: residual must use resolveDisplayedResidualOccupationalRisk`,
  );
  assert.match(
    source,
    /resolvedLabel:\s*riskData\?\.resolvedLabel/,
    `${name}: must pass resolvedLabel from RFD snapshot`,
  );
  assert.match(
    source,
    /residualLabel:\s*riskData\?\.residualLabel/,
    `${name}: must pass residualLabel from RFD snapshot`,
  );
  assert.doesNotMatch(
    source,
    /getMatrizRisk\(\s*risk\?\.severity,\s*riskData\?\.probability,\s*\)/,
    `${name} must not recalculate inherent RO via getMatrizRisk(S, probability)`,
  );
  assert.doesNotMatch(
    source,
    /getMatrizRisk\(\s*risk\?\.severity,\s*riskData\?\.probabilityAfter,\s*\)/,
    `${name} must not recalculate residual via getMatrizRisk alone`,
  );
}

assert.match(riskBox, /resolveDisplayedOccupationalRisk\(\{/);
assert.match(riskBox, /resolveDisplayedResidualOccupationalRisk\(\{/);
assert.match(riskBox, /resolvedLabel:\s*riskData\?\.resolvedLabel/);
assert.match(riskBox, /residualLabel:\s*riskData\?\.residualLabel/);
assert.doesNotMatch(
  riskBox,
  /getMatrizRisk\(data\?\.severity, residualProbability\)/,
);
assert.doesNotMatch(
  riskBox,
  /getMatrizRisk\(data\?\.severity, riskData\?\.probability\)/,
);

assert.match(matrixEquation, />\s*e\s*</);
assert.match(matrixEquation, />\s*→\s*</);
assert.match(
  matrixEquation,
  /Probabilidade e Severidade → Risco Ocupacional/,
);
assert.match(matrixEquation, /Quantitativo/);
assert.match(matrixEquation, /isQuantity/);
assert.match(matrixEquation, /quantitativePresentation/);
assert.match(matrixEquation, /resultColor/);
assert.doesNotMatch(matrixEquation, />\s*×\s*</);
assert.doesNotMatch(matrixEquation, />\s*=\s*</);

assert.match(riskBox, /resolveQuantitativeCollapsedPresentationFromSnapshot/);
assert.match(riskBox, /riskData\.determiningEvidences/);
assert.match(riskBox, /resultColor=\{inherentMatrix\?\.color\}/);
assert.match(riskBox, /isQuantity=\{!!riskData\?\.isQuantity\}/);
assert.match(riskBox, /quantitativePresentation=\{quantitativePresentation\}/);
assert.match(
  riskBox,
  /label="Residual"[\s\S]*?probability=\{residualProbability\}/,
);

console.log('matriz-call-sites.spec.ts ok');
