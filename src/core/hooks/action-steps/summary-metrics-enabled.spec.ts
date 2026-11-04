import assert from 'node:assert/strict';
import { shouldLoadSummaryMetrics } from './summary-metrics-enabled';
for (const stage of ['empresa', 'empregados', 'sst', 'documentos']) {
  assert.equal(shouldLoadSummaryMetrics(stage, false, false), false, 'wait for persisted card preference');
  assert.equal(shouldLoadSummaryMetrics(stage, true, true), false, 'hidden summaries do not request metrics');
  assert.equal(shouldLoadSummaryMetrics(stage, false, true), true, 'opening cards keeps full existing summaries');
}
assert.equal(shouldLoadSummaryMetrics('legacy-home', true, false), true, 'legacy home still shows summaries');
console.log('PASS summary queries follow visible cards and preserve legacy home');
