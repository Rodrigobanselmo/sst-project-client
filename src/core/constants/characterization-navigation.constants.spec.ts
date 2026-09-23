/**
 * Executar:
 * npx tsx src/core/constants/characterization-navigation.constants.spec.ts
 */
import assert from 'node:assert/strict';

import {
  ASSISTENTE_GSE_NAV_LABEL,
  CHARACTERIZATION_AI_PROFILES_NAV_LABEL,
  CHARACTERIZATION_SUB_TAB_PANEL,
  CHEMICAL_PRODUCTS_NAV_LABEL,
  CharacterizationSubTabEnum,
  getAssistenteGseNavStep,
  getCharacterizationSubareaNavItems,
  getCharacterizationTabFromWizardStep,
  getCharacterizationWizardStep,
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

assert.deepEqual(
  items.map((item) => item.label),
  [
    'Riscos',
    'GSE',
    'Elementos Caracterizados',
    'Vínculo de Riscos',
    'Priorização',
    'Exames',
    'Protocolos',
    CHEMICAL_PRODUCTS_NAV_LABEL,
    ASSISTENTE_GSE_NAV_LABEL,
    CHARACTERIZATION_AI_PROFILES_NAV_LABEL,
  ],
);

const tabIdentityContract = [
  {
    label: 'Riscos',
    tab: CharacterizationSubTabEnum.RISKS,
    active: '0',
    panel: 'risks',
  },
  {
    label: 'GSE',
    tab: CharacterizationSubTabEnum.GSE,
    active: '2',
    panel: 'gse',
  },
  {
    label: 'Elementos Caracterizados',
    tab: CharacterizationSubTabEnum.ENVIRONMENTS,
    active: '1',
    panel: 'environments',
  },
  {
    label: 'Vínculo de Riscos',
    tab: CharacterizationSubTabEnum.ENTITY_RISKS,
    active: '5',
    panel: 'entity-risks',
  },
  {
    label: 'Priorização',
    tab: CharacterizationSubTabEnum.PRIORITIZATION,
    active: '6',
    panel: 'prioritization',
  },
  {
    label: 'Exames',
    tab: CharacterizationSubTabEnum.EXAMS,
    active: '3',
    panel: 'exams',
  },
  {
    label: 'Protocolos',
    tab: CharacterizationSubTabEnum.PROTOCOLS,
    active: '4',
    panel: 'protocols',
  },
] as const;

for (const expected of tabIdentityContract) {
  const item = items.find(
    (entry) => entry.kind === 'tab' && entry.label === expected.label,
  );
  assert.ok(item && item.kind === 'tab', expected.label);
  assert.equal(item.tab, expected.tab, `${expected.label} enum`);
  assert.equal(String(item.tab), expected.active, `${expected.label} active`);
  assert.equal(
    parseCharacterizationActiveTab(expected.active),
    expected.tab,
    `${expected.label} parse active`,
  );
  assert.equal(
    CHARACTERIZATION_SUB_TAB_PANEL[item.tab],
    expected.panel,
    `${expected.label} panel`,
  );
  assert.equal(
    getCharacterizationTabFromWizardStep(
      getCharacterizationWizardStep(expected.tab),
    ),
    expected.tab,
    `${expected.label} wizard roundtrip`,
  );
}

assert.equal(
  getCharacterizationTabFromWizardStep(2),
  CharacterizationSubTabEnum.ENVIRONMENTS,
);
assert.notEqual(
  getCharacterizationTabFromWizardStep(2),
  CharacterizationSubTabEnum.PRIORITIZATION,
);
assert.equal(
  getCharacterizationTabFromWizardStep(4),
  CharacterizationSubTabEnum.PRIORITIZATION,
);
assert.notEqual(
  getCharacterizationTabFromWizardStep(4),
  CharacterizationSubTabEnum.EXAMS,
);

assert.equal(CharacterizationSubTabEnum.RISKS, 0);
assert.equal(CharacterizationSubTabEnum.ENVIRONMENTS, 1);
assert.equal(CharacterizationSubTabEnum.GSE, 2);
assert.equal(CharacterizationSubTabEnum.EXAMS, 3);
assert.equal(CharacterizationSubTabEnum.PROTOCOLS, 4);
assert.equal(CharacterizationSubTabEnum.ENTITY_RISKS, 5);
assert.equal(CharacterizationSubTabEnum.PRIORITIZATION, 6);

console.log('characterization-navigation.constants.spec.ts OK');
