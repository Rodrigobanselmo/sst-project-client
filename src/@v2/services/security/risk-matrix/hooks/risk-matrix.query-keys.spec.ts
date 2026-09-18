/**
 * Executar:
 * npx tsx src/@v2/services/security/risk-matrix/hooks/risk-matrix.query-keys.spec.ts
 */
import assert from 'node:assert/strict';

import { riskMatrixQueryKeys } from './risk-matrix.query-keys';

assert.deepEqual(riskMatrixQueryKeys.all, ['risk-matrices']);
assert.deepEqual(riskMatrixQueryKeys.browse('c1'), [
  'risk-matrices',
  'browse',
  'c1',
]);
assert.deepEqual(riskMatrixQueryKeys.read('c1', 'm1'), [
  'risk-matrices',
  'read',
  'c1',
  'm1',
]);
assert.deepEqual(riskMatrixQueryKeys.version('c1', 'm1', 'v1'), [
  'risk-matrices',
  'version',
  'c1',
  'm1',
  'v1',
]);
assert.deepEqual(
  riskMatrixQueryKeys.matrixWorkspaceAvailability('c1', 'm1'),
  ['risk-matrices', 'matrix-workspace-availability', 'c1', 'm1'],
);
assert.ok(riskMatrixQueryKeys.browse('c1')[0] === riskMatrixQueryKeys.all[0]);

console.log('risk-matrix.query-keys.spec.ts OK');
