/**
 * Executar:
 * npx tsx src/core/utils/helpers/format-quantitative-evidence.util.spec.ts
 *
 * Formatter de determiningEvidences (API) — sem heurística de json.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { NoiseQuantityEvidence } from 'core/interfaces/api/IRiskData';

import {
  formatDeterminingEvidences,
  formatQuantitativeEvidenceInline,
  resolveQuantitativeCollapsedPresentation,
  resolveQuantitativeCollapsedPresentationFromSnapshot,
} from './format-quantitative-evidence.util';

const source = readFileSync(
  resolve('src/core/utils/helpers/format-quantitative-evidence.util.ts'),
  'utf8',
);

assert.doesNotMatch(source, /formatQuantitativeEvidence\s*\(/);
assert.doesNotMatch(source, /ltcatq5/);
assert.doesNotMatch(source, /json\?\.type/);
assert.doesNotMatch(source, /QuantityTypeEnum/);
assert.doesNotMatch(source, /resolveNoiseContinuous/);
assert.doesNotMatch(source, /getMatrizRisk/);
assert.match(source, /formatDeterminingEvidences/);
assert.match(source, /determiningEvidences/);

// --- 0 evidências / snapshot ausente ---
assert.deepEqual(formatDeterminingEvidences(null), []);
assert.deepEqual(formatDeterminingEvidences(undefined), []);
assert.deepEqual(formatDeterminingEvidences([]), []);
assert.deepEqual(resolveQuantitativeCollapsedPresentationFromSnapshot(null), {
  mode: 'none',
});
assert.deepEqual(resolveQuantitativeCollapsedPresentation([]), { mode: 'none' });

// Ausência de snapshot NÃO inventa evidência a partir de json
assert.equal(
  resolveQuantitativeCollapsedPresentationFromSnapshot(undefined).mode,
  'none',
);

// --- 1 evidência Q3 ---
const q3: NoiseQuantityEvidence[] = [
  {
    criterion: 'NHO01_Q3',
    source: 'ltcatq3',
    value: '84',
    unit: 'dB(A)',
    band: 4,
    riskLevel: 4,
  },
];
const q3Items = formatDeterminingEvidences(q3);
assert.equal(q3Items.length, 1);
assert.deepEqual(q3Items[0], {
  criterionKey: 'NHO01_Q3',
  label: 'Q3',
  displayValue: '84 dB(A)',
});
assert.equal(formatQuantitativeEvidenceInline(q3Items[0]), 'Q3 84 dB(A)');
assert.deepEqual(resolveQuantitativeCollapsedPresentationFromSnapshot(q3), {
  mode: 'single',
  inlineEvidence: 'Q3 84 dB(A)',
});

// --- Q5 ---
const q5: NoiseQuantityEvidence[] = [
  {
    criterion: 'NR15_Q5',
    source: 'nr15q5',
    value: '68.4',
    unit: 'dB(A)',
    band: 2,
    riskLevel: 2,
  },
];
assert.equal(
  formatDeterminingEvidences(q5)[0].displayValue,
  '68,4 dB(A)',
);
assert.equal(formatDeterminingEvidences(q5)[0].label, 'Q5');

// --- impacto NR15 / NHO01 ---
assert.equal(
  formatDeterminingEvidences([
    {
      criterion: 'IMPACT_NR15',
      source: 'impactPeak',
      value: '125',
      unit: 'dB(C)',
      band: 4,
      riskLevel: 4,
    },
  ])[0].label,
  'Impacto NR-15',
);
assert.equal(
  formatDeterminingEvidences([
    {
      criterion: 'IMPACT_NHO01',
      source: 'impactPeak',
      value: '130',
      unit: 'dB(Lin)',
      band: 5,
      riskLevel: 5,
    },
  ])[0].label,
  'Impacto NHO 01',
);

// --- empate (2+) ---
const tie: NoiseQuantityEvidence[] = [
  {
    criterion: 'NHO01_Q3',
    source: 'ltcatq3',
    value: '80',
    unit: 'dB(A)',
    band: 3,
    riskLevel: 3,
  },
  {
    criterion: 'IMPACT_NR15',
    source: 'impactPeak',
    value: '125',
    unit: 'dB(C)',
    band: 3,
    riskLevel: 3,
  },
];
const tiePresentation =
  resolveQuantitativeCollapsedPresentationFromSnapshot(tie);
assert.equal(tiePresentation.mode, 'multiple');
assert.equal(tiePresentation.inlineEvidence, 'múltiplas evidências');
assert.equal(
  tiePresentation.tooltip,
  'Q3: 80 dB(A)\nImpacto NR-15: 125 dB(C)',
);

console.log('format-quantitative-evidence.util.spec.ts ok');
