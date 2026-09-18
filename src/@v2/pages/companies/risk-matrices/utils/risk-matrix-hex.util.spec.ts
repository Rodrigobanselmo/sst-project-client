/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-hex.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  isValidRiskMatrixHex,
  normalizeRiskMatrixHex,
  RISK_MATRIX_SUGGESTED_COLORS,
} from './risk-matrix-hex.util';

assert.equal(normalizeRiskMatrixHex('#f00'), '#FF0000');
assert.equal(normalizeRiskMatrixHex('#00ff00'), '#00FF00');
assert.equal(normalizeRiskMatrixHex('00F'), '#0000FF');
assert.equal(normalizeRiskMatrixHex('transparent'), null);
assert.equal(normalizeRiskMatrixHex(''), null);
assert.equal(normalizeRiskMatrixHex('#GGG'), null);
assert.equal(isValidRiskMatrixHex('#abc'), true);
assert.equal(isValidRiskMatrixHex('#123456'), true);
assert.equal(isValidRiskMatrixHex('red'), false);
assert.equal(isValidRiskMatrixHex('#7A3CFF'), true);
assert.equal(normalizeRiskMatrixHex('#7a3cff'), '#7A3CFF');
assert.ok(!RISK_MATRIX_SUGGESTED_COLORS.includes('transparent' as never));
assert.ok(RISK_MATRIX_SUGGESTED_COLORS.every((color) => isValidRiskMatrixHex(color)));

console.log('risk-matrix-hex.util.spec.ts OK');
