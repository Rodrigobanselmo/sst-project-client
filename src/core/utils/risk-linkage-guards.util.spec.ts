/**
 * Executar: npx tsx src/core/utils/risk-linkage-guards.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  RISK_LINKAGE_EMPTY_MESSAGE,
  RISK_LINKAGE_ENTITY_UNAVAILABLE_MESSAGE,
  RISK_LINKAGE_LOAD_ERROR_MESSAGE,
  RISK_LINKAGE_SELECT_ENTITY_MESSAGE,
  characterizationDisplayName,
  coerceGhoQueryList,
  coerceRiskDataList,
  riskLinkageEmptyMessage,
} from './risk-linkage-guards.util';

assert.equal(characterizationDisplayName(null, 'Posto A'), 'Posto A');
assert.equal(characterizationDisplayName(undefined, 'Posto A'), 'Posto A');
assert.equal(characterizationDisplayName('Sala 1(//)extra', 'Posto A'), 'Sala 1');
assert.equal(characterizationDisplayName(null, null), '');
assert.equal(characterizationDisplayName(null, undefined), '');

assert.deepEqual(coerceGhoQueryList(undefined), []);
assert.deepEqual(coerceGhoQueryList(null), []);
assert.deepEqual(coerceGhoQueryList([{ id: '1' }]), [{ id: '1' }]);

assert.deepEqual(coerceRiskDataList(undefined), []);
assert.deepEqual(coerceRiskDataList(null), []);
assert.deepEqual(coerceRiskDataList([{ id: 'r1' }]), [{ id: 'r1' }]);

assert.equal(
  riskLinkageEmptyMessage({ hasSelection: true }),
  RISK_LINKAGE_EMPTY_MESSAGE,
);
assert.equal(
  riskLinkageEmptyMessage({ hasSelection: false }),
  RISK_LINKAGE_SELECT_ENTITY_MESSAGE,
);
assert.equal(
  riskLinkageEmptyMessage({ hasSelection: true, selectionMissing: true }),
  RISK_LINKAGE_ENTITY_UNAVAILABLE_MESSAGE,
);

assert.equal(
  RISK_LINKAGE_EMPTY_MESSAGE,
  'Nenhum fator de risco vinculado a esta entidade.',
);
assert.equal(
  RISK_LINKAGE_LOAD_ERROR_MESSAGE,
  'Não foi possível carregar os fatores de risco desta entidade.',
);

console.log('risk-linkage-guards.util.spec.ts OK');
