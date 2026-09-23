/**
 * Executar:
 * npx tsx src/core/constants/characterization-navigation.constants.spec.ts
 */
import assert from 'node:assert/strict';

import {
  ASSISTENTE_GSE_NAV_LABEL,
  CharacterizationSubTabEnum,
  getAssistenteGseNavStep,
  getCharacterizationSubareaNavItems,
  parseCharacterizationActiveTab,
} from './characterization-navigation.constants';

assert.equal(ASSISTENTE_GSE_NAV_LABEL, 'Assistente de GSE');

const items = getCharacterizationSubareaNavItems();
const assistente = items.find(
  (item) => item.kind === 'external' && item.id === 'assistente-gse',
);
assert.ok(assistente);
assert.equal(assistente?.label, 'Assistente de GSE');
assert.ok(getAssistenteGseNavStep() >= 0);

const tabItems = items.filter((item) => item.kind === 'tab');
assert.deepEqual(
  tabItems.map((item) => item.label),
  [
    'Riscos',
    'GSE',
    'Elementos Caracterizados',
    'Vínculo de Riscos',
    'Priorização',
    'Exames',
    'Protocolos',
  ],
);
assert.equal(
  parseCharacterizationActiveTab('6'),
  CharacterizationSubTabEnum.PRIORITIZATION,
);
assert.equal(
  parseCharacterizationActiveTab('5'),
  CharacterizationSubTabEnum.ENTITY_RISKS,
);
assert.equal(
  parseCharacterizationActiveTab('2'),
  CharacterizationSubTabEnum.GSE,
);

console.log('characterization-navigation.constants.spec.ts OK');
