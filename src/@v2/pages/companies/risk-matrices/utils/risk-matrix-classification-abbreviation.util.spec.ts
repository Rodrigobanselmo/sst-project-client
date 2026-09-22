/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-classification-abbreviation.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  findDuplicateClassificationAbbreviations,
  formatClassificationDisplayLabel,
  isValidRiskMatrixClassificationAbbreviationFormat,
  normalizeRiskMatrixClassificationAbbreviation,
  sanitizeRiskMatrixClassificationAbbreviationInput,
} from './risk-matrix-classification-abbreviation.util';

assert.equal(normalizeRiskMatrixClassificationAbbreviation(' da '), 'DA');
assert.equal(normalizeRiskMatrixClassificationAbbreviation('a'), 'A');
assert.equal(sanitizeRiskMatrixClassificationAbbreviationInput('d-a!1'), 'DA1');
assert.equal(sanitizeRiskMatrixClassificationAbbreviationInput('toolong'), 'TOOL');
assert.equal(isValidRiskMatrixClassificationAbbreviationFormat('MB'), true);
assert.equal(isValidRiskMatrixClassificationAbbreviationFormat('A'), true);
assert.equal(isValidRiskMatrixClassificationAbbreviationFormat(''), false);
assert.equal(isValidRiskMatrixClassificationAbbreviationFormat('TOOLONG'), false);
assert.equal(isValidRiskMatrixClassificationAbbreviationFormat('A-B'), false);

assert.deepEqual(
  findDuplicateClassificationAbbreviations([
    { key: 'C1', abbreviation: 'A' },
    { key: 'C2', abbreviation: 'a' },
    { key: 'C3', abbreviation: 'B' },
  ]),
  ['A'],
);

assert.deepEqual(
  findDuplicateClassificationAbbreviations([
    { key: 'C1', abbreviation: 'A' },
    { key: 'C2', abbreviation: 'M' },
  ]),
  [],
);

assert.equal(
  formatClassificationDisplayLabel({ label: 'Aceitável', abbreviation: 'A' }),
  'A — Aceitável',
);
assert.equal(
  formatClassificationDisplayLabel({ label: '  ', abbreviation: '' }),
  'Sem nome',
);

// SYSTEM-looking shorts are allowed in CUSTOM (no global reserve).
assert.equal(isValidRiskMatrixClassificationAbbreviationFormat('MB'), true);
assert.equal(isValidRiskMatrixClassificationAbbreviationFormat('IA'), true);

console.log('risk-matrix-classification-abbreviation.util.spec.ts OK');
