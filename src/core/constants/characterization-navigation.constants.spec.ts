/**
 * Executar:
 * npx tsx src/core/constants/characterization-navigation.constants.spec.ts
 */
import assert from 'node:assert/strict';

import {
  ASSISTENTE_GSE_NAV_LABEL,
  getAssistenteGseNavStep,
  getCharacterizationSubareaNavItems,
} from './characterization-navigation.constants';

assert.equal(ASSISTENTE_GSE_NAV_LABEL, 'Assistente de GSE');

const items = getCharacterizationSubareaNavItems();
const assistente = items.find(
  (item) => item.kind === 'external' && item.id === 'assistente-gse',
);
assert.ok(assistente);
assert.equal(assistente?.label, 'Assistente de GSE');
assert.ok(getAssistenteGseNavStep() >= 0);

console.log('characterization-navigation.constants.spec.ts OK');
