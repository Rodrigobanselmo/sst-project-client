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
    'Exames',
    'Protocolos',
    CHEMICAL_PRODUCTS_NAV_LABEL,
    ASSISTENTE_GSE_NAV_LABEL,
    CHARACTERIZATION_AI_PROFILES_NAV_LABEL,
  ],
);

const tabIdentityContract = [
  {
    label: 'Importação de riscos',
    tab: CharacterizationSubTabEnum.RISK_IMPORT,
    active: '8',
    panel: 'risk-import',
  },
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
    label: 'Inventário de Riscos',
    tab: CharacterizationSubTabEnum.RISK_INVENTORY,
    active: '7',
    panel: 'risk-inventory',
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

const nestedRiskTabs = [CharacterizationSubTabEnum.ENTITY_RISKS, CharacterizationSubTabEnum.RISK_IMPORT, CharacterizationSubTabEnum.PRIORITIZATION, CharacterizationSubTabEnum.RISK_INVENTORY];
for (const expected of tabIdentityContract) {
  assert.equal(parseCharacterizationActiveTab(expected.active), expected.tab, `${expected.label} mantém bookmark`);
  assert.equal(CHARACTERIZATION_SUB_TAB_PANEL[expected.tab], expected.panel);
  const parent = nestedRiskTabs.includes(expected.tab) ? CharacterizationSubTabEnum.RISKS : expected.tab;
  assert.equal(getCharacterizationTabFromWizardStep(getCharacterizationWizardStep(expected.tab)), parent, `${expected.label} abre no grupo correto`);
}
for (const tab of nestedRiskTabs) {
  assert.equal(items.some((entry) => entry.kind === 'tab' && entry.tab === tab), false);
}
assert.equal(getCharacterizationTabFromWizardStep(2), CharacterizationSubTabEnum.ENVIRONMENTS);
assert.equal(getCharacterizationTabFromWizardStep(3), CharacterizationSubTabEnum.EXAMS);

assert.equal(CharacterizationSubTabEnum.RISKS, 0);
assert.equal(CharacterizationSubTabEnum.ENVIRONMENTS, 1);
assert.equal(CharacterizationSubTabEnum.GSE, 2);
assert.equal(CharacterizationSubTabEnum.EXAMS, 3);
assert.equal(CharacterizationSubTabEnum.PROTOCOLS, 4);
assert.equal(CharacterizationSubTabEnum.ENTITY_RISKS, 5);
assert.equal(CharacterizationSubTabEnum.PRIORITIZATION, 6);

console.log('characterization-navigation.constants.spec.ts OK');
