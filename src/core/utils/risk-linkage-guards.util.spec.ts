/**
 * Executar: npx tsx src/core/utils/risk-linkage-guards.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  RISK_LINKAGE_EMPTY_MESSAGE,
  characterizationDisplayName,
  coerceGhoQueryList,
} from './risk-linkage-guards.util';

assert.equal(characterizationDisplayName(null, 'Posto A'), 'Posto A');
assert.equal(characterizationDisplayName(undefined, 'Posto A'), 'Posto A');
assert.equal(characterizationDisplayName('Sala 1(//)extra', 'Posto A'), 'Sala 1');
assert.equal(characterizationDisplayName(null, null), '');
assert.equal(characterizationDisplayName(null, undefined), '');

assert.deepEqual(coerceGhoQueryList(undefined), []);
assert.deepEqual(coerceGhoQueryList(null), []);
assert.deepEqual(coerceGhoQueryList([{ id: '1' }]), [{ id: '1' }]);

assert.equal(
  RISK_LINKAGE_EMPTY_MESSAGE,
  'Nenhum fator de risco vinculado a esta entidade.',
);

console.log('risk-linkage-guards.util.spec.ts OK');
