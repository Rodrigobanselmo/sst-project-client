/**
 * npx tsx src/pages/login/helpers/format-login-stat.spec.ts
 */
import assert from 'node:assert/strict';

import { formatLoginStat } from './format-login-stat';

assert.equal(formatLoginStat(0), '+0');
assert.equal(formatLoginStat(999), '+999');
assert.equal(formatLoginStat(1000), '+1 mil');
assert.equal(formatLoginStat(5284), '+5 mil');
assert.equal(formatLoginStat(31204), '+31 mil');
assert.equal(formatLoginStat(127420), '+127 mil');
assert.equal(formatLoginStat(1_000_000), '+1 mi');
assert.equal(formatLoginStat(1_284_000), '+1,2 mi');
assert.equal(formatLoginStat(1_999_999), '+1,9 mi');
assert.equal(formatLoginStat(2_000_000), '+2 mi');
assert.equal(formatLoginStat(-1), '');
assert.equal(formatLoginStat(Number.NaN), '');

console.log('format-login-stat.spec.ts ok');
