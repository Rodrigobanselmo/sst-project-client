/**
 * Executar:
 * npx tsx src/core/utils/helpers/simple-sst-scale-chip.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  formatSimpleSstScaleFactorLabel,
  getSimpleSstScaleChipColors,
  isSimpleSstScaleAction,
} from './simple-sst-scale-chip.util';

const EXPECTED_S1_TO_S5: Record<
  number,
  { bgcolor: string; color: string; label: string }
> = {
  1: { bgcolor: 'scale.low', color: 'common.white', label: 'S1' },
  2: { bgcolor: 'scale.mediumLow', color: 'common.white', label: 'S2' },
  3: { bgcolor: 'scale.medium', color: 'text.dark', label: 'S3' },
  4: { bgcolor: 'scale.mediumHigh', color: 'common.white', label: 'S4' },
  5: { bgcolor: 'scale.high', color: 'common.white', label: 'S5' },
};

for (let severity = 1; severity <= 5; severity += 1) {
  const expected = EXPECTED_S1_TO_S5[severity];
  assert.equal(formatSimpleSstScaleFactorLabel('S', severity), expected.label);
  assert.deepEqual(getSimpleSstScaleChipColors(severity), {
    bgcolor: expected.bgcolor,
    color: expected.color,
  });
  assert.equal(isSimpleSstScaleAction(String(severity)), true);
}

assert.equal(formatSimpleSstScaleFactorLabel('P', 3), 'P3');
assert.equal(formatSimpleSstScaleFactorLabel('S', null), 'S--');
assert.equal(formatSimpleSstScaleFactorLabel('S', 0), 'S--');

assert.deepEqual(getSimpleSstScaleChipColors(3), {
  bgcolor: 'scale.medium',
  color: 'text.dark',
});

assert.deepEqual(getSimpleSstScaleChipColors(6), {
  bgcolor: 'common.black',
  color: 'common.white',
});

assert.equal(isSimpleSstScaleAction('warning'), false);
assert.equal(isSimpleSstScaleAction('3'), true);

console.log('simple-sst-scale-chip.util.spec.ts ok');
