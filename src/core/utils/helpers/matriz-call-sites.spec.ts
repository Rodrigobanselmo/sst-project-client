/**
 * Executar:
 * npx tsx src/core/utils/helpers/matriz-call-sites.spec.ts
 *
 * Garante o contrato getMatrizRisk(severity, probability) nos call sites
 * do RiskTool que historicamente invertia os argumentos.
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

assert.match(
  matrizHelper,
  /getMatrizRisk = \(severity\?: number, probability\?: number\)/,
);
assert.match(
  matrizHelper,
  /resolveMatrixRiskLevel\(\s*severity\?: number,\s*probability\?: number/,
);

for (const [name, source] of [
  ['RiskTool RowColumns', riskToolRowColumns],
  ['RiskToolV2 RowColumns', riskToolV2RowColumns],
] as const) {
  assert.match(
    source,
    /getMatrizRisk\(\s*risk\?\.severity,\s*riskData\?\.probability,\s*\)/,
    `${name}: inherent lookup must be getMatrizRisk(severity, probability)`,
  );
  assert.match(
    source,
    /getMatrizRisk\(\s*risk\?\.severity,\s*riskData\?\.probabilityAfter,\s*\)/,
    `${name}: residual lookup must be getMatrizRisk(severity, probabilityAfter)`,
  );
  assert.doesNotMatch(
    source,
    /getMatrizRisk\(\s*riskData\?\.probability,\s*risk\?\.severity/,
    `${name} must not pass probability as the first argument`,
  );
}

assert.match(
  riskBox,
  /getMatrizRisk\(data\?\.severity, riskData\?\.probability\)/,
);
assert.match(
  riskBox,
  /getMatrizRisk\(data\?\.severity, residualProbability\)/,
);
assert.doesNotMatch(
  riskBox,
  /getMatrizRisk\(riskData\?\.probability, data\?\.severity/,
);
assert.doesNotMatch(
  riskBox,
  /getMatrizRisk\(residualProbability, data\?\.severity/,
);

assert.match(matrixEquation, />\s*e\s*</);
assert.match(matrixEquation, />\s*→\s*</);
assert.match(
  matrixEquation,
  /Probabilidade e Severidade → Risco Ocupacional/,
);
assert.doesNotMatch(matrixEquation, />\s*×\s*</);
assert.doesNotMatch(matrixEquation, />\s*=\s*</);

console.log('matriz-call-sites.spec.ts ok');
