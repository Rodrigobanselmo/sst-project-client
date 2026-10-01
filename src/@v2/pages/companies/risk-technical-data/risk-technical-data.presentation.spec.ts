/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-technical-data/risk-technical-data.presentation.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { RiskTechnicalDataRisk } from '@v2/services/security/risk-technical-data/risk-technical-data.types';

import { RiskTechnicalColumnsPreference } from '@v2/services/security/risk-technical-data/risk-technical-data.types';

import {
  RISK_TECHNICAL_OTHER_COLUMNS,
  RISK_TECHNICAL_PHYSICAL_COLUMNS,
  riskTechnicalCellText,
  riskTechnicalColumnAlign,
  riskTechnicalColumnHeaderOrientation,
  riskTechnicalColumnVisible,
  riskTechnicalColumns,
  riskTechnicalLayouts,
  riskTechnicalTitleChoice,
  riskTechnicalWidthPercent,
  risksForTechnicalGroup,
  shouldLoadRiskTechnicalData,
} from './risk-technical-data.presentation';

const here = dirname(fileURLToPath(import.meta.url));
const tableSource = readFileSync(
  join(here, '../../../../components/organisms/tables/RiskCompanyTable/RiskCompanyTable.tsx'),
  'utf8',
);
const characterizationSource = readFileSync(
  join(
    here,
    '../../../../pages/dashboard/empresas/[companyId]/novo/[stage]/components/CharacterizationStage/CharacterizationStage.tsx',
  ),
  'utf8',
);
const risksPageSource = readFileSync(
  join(here, '../../../../pages/dashboard/empresas/[companyId]/riscos/index.page.tsx'),
  'utf8',
);
const factorsPageSource = readFileSync(
  join(here, '../../../../pages/dashboard/empresas/[companyId]/fatores-riscos/index.page.tsx'),
  'utf8',
);
const viewSource = readFileSync(join(here, 'RiskTechnicalDataView.tsx'), 'utf8');
const gridSource = readFileSync(join(here, 'RiskTechnicalDataGrid.tsx'), 'utf8');
const dialogSource = readFileSync(join(here, 'RiskTechnicalDataColumnsDialog.tsx'), 'utf8');

const risk = (patch: Partial<RiskTechnicalDataRisk> & Pick<RiskTechnicalDataRisk, 'id' | 'name' | 'type'>): RiskTechnicalDataRisk => ({
  subTypes: [],
  cas: null,
  propagation: [],
  unit: null,
  nr15lt: null,
  twa: null,
  stel: null,
  ipvs: null,
  pv: null,
  pe: null,
  carnogenicityACGIH: null,
  carnogenicityLinach: null,
  exams: [],
  severity: 0,
  symptoms: null,
  healthRisk: null,
  ...patch,
});

const rows = [
  risk({ id: 'fis', name: 'Ruído', type: 'FIS' }),
  risk({ id: 'qui', name: 'Tolueno', type: 'QUI' }),
  risk({ id: 'bio', name: 'Vírus', type: 'BIO' }),
  risk({ id: 'erg', name: 'Postura', type: 'ERG' }),
  risk({ id: 'aci', name: 'Queda', type: 'ACI' }),
  risk({ id: 'out', name: 'Outro', type: 'OUTROS' }),
];

assert.deepEqual(
  risksForTechnicalGroup(rows, 'PHYSICAL_CHEMICAL').map((item) => item.type),
  ['FIS', 'QUI'],
);
assert.deepEqual(
  risksForTechnicalGroup(rows, 'OTHER').map((item) => item.type),
  ['BIO', 'ERG', 'ACI', 'OUTROS'],
);

const empty = risk({ id: 'empty', name: 'Sem dado', type: 'QUI', severity: 0 });
assert.equal(riskTechnicalCellText(empty, 'cas'), '');
assert.equal(riskTechnicalCellText(empty, 'symptoms'), '');
assert.equal(riskTechnicalCellText(empty, 'effects'), '');
assert.equal(riskTechnicalCellText(empty, 'severity'), '');
assert.equal(riskTechnicalCellText(empty, 'propagation'), '');
assert.equal(
  riskTechnicalCellText(
    risk({
      id: 'full',
      name: 'Tolueno',
      type: 'QUI',
      propagation: ['Ar'],
      exams: ['Hemograma'],
      severity: 3,
      symptoms: 'Irritação',
      healthRisk: 'Fígado',
    }),
    'effects',
  ),
  'Fígado',
);

assert.deepEqual(
  RISK_TECHNICAL_PHYSICAL_COLUMNS.map((column) => column.key),
  [
    'type',
    'factor',
    'cas',
    'propagation',
    'unit',
    'nr15lt',
    'twa',
    'stel',
    'ipvs',
    'pv',
    'pe',
    'carnogenicityACGIH',
    'carnogenicityLinach',
    'exams',
    'severity',
    'symptoms',
    'effects',
  ],
);
assert.equal(
  RISK_TECHNICAL_PHYSICAL_COLUMNS.some((column) => column.key === 'factor' && column.headerLabel === 'Fator de risco'),
  true,
);
assert.equal(
  RISK_TECHNICAL_PHYSICAL_COLUMNS.some((column) => column.key === 'type' && column.headerLabel === 'Tipo'),
  true,
);
assert.equal(RISK_TECHNICAL_PHYSICAL_COLUMNS[0]?.key, 'type');
assert.equal(RISK_TECHNICAL_PHYSICAL_COLUMNS[1]?.key, 'factor');
const physicalSymptoms = RISK_TECHNICAL_PHYSICAL_COLUMNS.find((column) => column.key === 'symptoms')!;
const physicalEffects = RISK_TECHNICAL_PHYSICAL_COLUMNS.find((column) => column.key === 'effects')!;
const physicalCas = RISK_TECHNICAL_PHYSICAL_COLUMNS.find((column) => column.key === 'cas')!;
assert.ok(physicalSymptoms.widthWeight > physicalCas.widthWeight);
assert.ok(physicalEffects.widthWeight > physicalCas.widthWeight);

assert.deepEqual(
  RISK_TECHNICAL_OTHER_COLUMNS.map((column) => column.key),
  ['type', 'factor', 'propagation', 'exams', 'severity', 'symptoms', 'effects'],
);
assert.equal(RISK_TECHNICAL_OTHER_COLUMNS[0]?.key, 'type');
assert.equal(RISK_TECHNICAL_OTHER_COLUMNS[1]?.key, 'factor');
assert.equal(
  RISK_TECHNICAL_OTHER_COLUMNS.some((column) =>
    ['cas', 'unit', 'nr15lt', 'twa', 'stel', 'ipvs', 'pv', 'pe', 'carnogenicityACGIH'].includes(column.key),
  ),
  false,
);
assert.equal(riskTechnicalColumns('OTHER'), RISK_TECHNICAL_OTHER_COLUMNS);

assert.equal(
  shouldLoadRiskTechnicalData({
    queryEnabled: true,
    isAllEstablishments: false,
    workspaceId: 'ws-1',
  }),
  true,
);
assert.equal(
  shouldLoadRiskTechnicalData({
    queryEnabled: true,
    isAllEstablishments: true,
    workspaceId: 'ws-1',
  }),
  false,
);
assert.equal(
  shouldLoadRiskTechnicalData({
    queryEnabled: false,
    isAllEstablishments: false,
    workspaceId: 'ws-1',
  }),
  false,
);
assert.equal(
  shouldLoadRiskTechnicalData({
    queryEnabled: true,
    isAllEstablishments: false,
  }),
  false,
);

assert.equal(viewSource.includes('shouldLoadRiskTechnicalData'), true);
assert.equal(viewSource.includes('Selecione um estabelecimento para ver os Dados Técnicos.'), true);
assert.equal(viewSource.includes('useState<RiskTechnicalDataGroup>(\'PHYSICAL_CHEMICAL\')'), true);
assert.equal(viewSource.includes('Riscos nas linhas'), false);

assert.equal(tableSource.includes('enableSectorRiskPresenceMap'), true);
assert.equal(tableSource.includes('<ToggleButton value="technical">Dados Técnicos</ToggleButton>'), true);
assert.equal(tableSource.includes("presenceView === 'presence'"), true);
assert.equal(tableSource.includes("presenceView === 'technical'"), true);
assert.equal(tableSource.includes('<SectorRiskPresenceView'), true);
assert.equal(tableSource.includes('<RiskTechnicalDataView'), true);
assert.equal(tableSource.includes('useQueryRisksCompany'), true);
assert.equal(characterizationSource.includes('enableSectorRiskPresenceMap'), true);
assert.equal(risksPageSource.includes('enableSectorRiskPresenceMap'), false);
assert.equal(factorsPageSource.includes('enableSectorRiskPresenceMap'), false);

const percentSum = (group: 'PHYSICAL_CHEMICAL' | 'OTHER', preference: RiskTechnicalColumnsPreference | null = null) =>
  riskTechnicalLayouts(group, preference).reduce((sum, column) => sum + column.percent, 0);

assert.ok(Math.abs(percentSum('PHYSICAL_CHEMICAL') - 100) < 0.001);
assert.ok(Math.abs(percentSum('OTHER') - 100) < 0.001);
assert.equal(
  riskTechnicalWidthPercent(16, 100) + riskTechnicalWidthPercent(84, 100),
  100,
);

const physicalCanonicalWeights: Record<string, number> = {
  type: 1,
  factor: 10,
  cas: 2,
  propagation: 2,
  unit: 3,
  nr15lt: 3,
  twa: 3,
  stel: 3,
  ipvs: 3,
  pv: 2,
  pe: 2,
  carnogenicityACGIH: 2,
  carnogenicityLinach: 2,
  exams: 10,
  severity: 2,
  symptoms: 16,
  effects: 16,
};
const otherCanonicalWeights: Record<string, number> = {
  type: 1,
  factor: 14,
  propagation: 2,
  exams: 10,
  severity: 2,
  symptoms: 21,
  effects: 21,
};
const otherCanonicalPercents: Record<string, number> = {
  type: 1.4,
  factor: 19.7,
  propagation: 2.8,
  exams: 14.1,
  severity: 2.8,
  symptoms: 29.6,
  effects: 29.6,
};

const physicalCanonical = riskTechnicalLayouts('PHYSICAL_CHEMICAL', null);
const otherCanonical = riskTechnicalLayouts('OTHER', null);
for (const column of physicalCanonical) {
  assert.equal(column.weight, physicalCanonicalWeights[column.key]);
}
for (const column of otherCanonical) {
  assert.equal(column.weight, otherCanonicalWeights[column.key]);
  assert.ok(Math.abs(column.percent - otherCanonicalPercents[column.key]) < 0.05);
}

assert.equal(physicalCanonical.find((column) => column.key === 'type')?.contentOrientation, 'VERTICAL');
assert.equal(physicalCanonical.find((column) => column.key === 'type')?.headerOrientation, 'VERTICAL');
assert.equal(physicalCanonical.find((column) => column.key === 'type')?.align, 'center');
assert.equal(physicalCanonical.find((column) => column.key === 'type')?.weight, 1);
assert.equal(physicalCanonical[0]?.key, 'type');
assert.equal(physicalCanonical[1]?.key, 'factor');
assert.equal(physicalCanonical.find((column) => column.key === 'factor')?.contentOrientation, 'HORIZONTAL');
assert.equal(physicalCanonical.find((column) => column.key === 'factor')?.headerOrientation, 'HORIZONTAL');
assert.equal(physicalCanonical.find((column) => column.key === 'cas')?.contentOrientation, 'VERTICAL');
assert.equal(physicalCanonical.find((column) => column.key === 'cas')?.headerOrientation, 'VERTICAL');
assert.equal(physicalCanonical.find((column) => column.key === 'propagation')?.contentOrientation, 'VERTICAL');
assert.equal(physicalCanonical.find((column) => column.key === 'unit')?.contentOrientation, 'HORIZONTAL');
assert.equal(physicalCanonical.find((column) => column.key === 'unit')?.headerOrientation, 'VERTICAL');
assert.equal(physicalCanonical.find((column) => column.key === 'stel')?.contentOrientation, 'HORIZONTAL');
assert.equal(physicalCanonical.find((column) => column.key === 'stel')?.headerOrientation, 'VERTICAL');
assert.equal(physicalCanonical.find((column) => column.key === 'pe')?.contentOrientation, 'HORIZONTAL');
assert.equal(physicalCanonical.find((column) => column.key === 'pe')?.headerOrientation, 'HORIZONTAL');
assert.equal(physicalCanonical.find((column) => column.key === 'pv')?.contentOrientation, 'VERTICAL');
assert.equal(physicalCanonical.find((column) => column.key === 'severity')?.contentOrientation, 'HORIZONTAL');
assert.equal(physicalCanonical.find((column) => column.key === 'severity')?.headerOrientation, 'VERTICAL');
assert.equal(riskTechnicalTitleChoice(RISK_TECHNICAL_PHYSICAL_COLUMNS, null, 'unit'), 'VERTICAL');
assert.equal(riskTechnicalTitleChoice(RISK_TECHNICAL_PHYSICAL_COLUMNS, null, 'pe'), 'SAME');

assert.equal(otherCanonical.find((column) => column.key === 'type')?.contentOrientation, 'VERTICAL');
assert.equal(otherCanonical.find((column) => column.key === 'type')?.headerOrientation, 'VERTICAL');
assert.equal(otherCanonical.find((column) => column.key === 'type')?.align, 'center');
assert.equal(otherCanonical[0]?.key, 'type');
assert.equal(otherCanonical[1]?.key, 'factor');
assert.equal(otherCanonical.find((column) => column.key === 'propagation')?.contentOrientation, 'HORIZONTAL');
assert.equal(otherCanonical.find((column) => column.key === 'propagation')?.headerOrientation, 'VERTICAL');
assert.equal(otherCanonical.find((column) => column.key === 'severity')?.contentOrientation, 'HORIZONTAL');
assert.equal(otherCanonical.find((column) => column.key === 'severity')?.headerOrientation, 'VERTICAL');
assert.equal(otherCanonical.find((column) => column.key === 'effects')?.contentOrientation, 'HORIZONTAL');
assert.equal(otherCanonical.find((column) => column.key === 'effects')?.headerOrientation, 'HORIZONTAL');
assert.equal(riskTechnicalTitleChoice(RISK_TECHNICAL_OTHER_COLUMNS, null, 'propagation'), 'VERTICAL');
assert.equal(riskTechnicalTitleChoice(RISK_TECHNICAL_OTHER_COLUMNS, null, 'factor'), 'SAME');

for (const key of ['factor', 'exams', 'symptoms', 'effects'] as const) {
  assert.equal(riskTechnicalColumnAlign(key), 'left');
  assert.equal(physicalCanonical.find((column) => column.key === key)?.align, 'left');
  assert.equal(otherCanonical.find((column) => column.key === key)?.align, 'left');
}
for (const key of ['type', 'cas', 'propagation', 'unit', 'nr15lt', 'twa', 'stel', 'ipvs', 'pv', 'pe', 'carnogenicityACGIH', 'carnogenicityLinach', 'severity'] as const) {
  assert.equal(riskTechnicalColumnAlign(key), 'center');
  assert.equal(physicalCanonical.find((column) => column.key === key)?.align, 'center');
}
assert.equal(otherCanonical.find((column) => column.key === 'propagation')?.align, 'center');
assert.equal(otherCanonical.find((column) => column.key === 'severity')?.align, 'center');

const physicalPreference: RiskTechnicalColumnsPreference = {
  version: 1,
  columns: RISK_TECHNICAL_PHYSICAL_COLUMNS.map((column) => ({
    key: column.key,
    orientation: column.key === 'factor' ? 'VERTICAL' : 'HORIZONTAL',
    ...(column.key === 'cas' ? { headerOrientation: 'HORIZONTAL' as const } : {}),
    widthWeight: column.key === 'symptoms' ? 40 : 4,
  })),
};
const otherPreference: RiskTechnicalColumnsPreference = {
  version: 1,
  columns: RISK_TECHNICAL_OTHER_COLUMNS.map((column) => ({
    key: column.key,
    orientation: 'HORIZONTAL' as const,
    ...(column.key === 'severity' ? { headerOrientation: 'VERTICAL' as const } : {}),
    widthWeight: 10,
  })),
};

const physicalSaved = riskTechnicalLayouts('PHYSICAL_CHEMICAL', physicalPreference);
const otherSaved = riskTechnicalLayouts('OTHER', otherPreference);
assert.equal(physicalSaved.find((column) => column.key === 'factor')?.contentOrientation, 'VERTICAL');
assert.equal(riskTechnicalTitleChoice(RISK_TECHNICAL_PHYSICAL_COLUMNS, physicalPreference, 'cas'), 'HORIZONTAL');
assert.equal(riskTechnicalColumnHeaderOrientation(RISK_TECHNICAL_PHYSICAL_COLUMNS, physicalPreference, 'cas'), 'HORIZONTAL');
assert.equal(riskTechnicalTitleChoice(RISK_TECHNICAL_PHYSICAL_COLUMNS, physicalPreference, 'factor'), 'SAME');
assert.equal(riskTechnicalTitleChoice(RISK_TECHNICAL_OTHER_COLUMNS, otherPreference, 'severity'), 'VERTICAL');
assert.equal(otherSaved.find((column) => column.key === 'severity')?.contentOrientation, 'HORIZONTAL');
assert.equal(otherSaved.find((column) => column.key === 'severity')?.headerOrientation, 'VERTICAL');
assert.equal(physicalSaved.find((column) => column.key === 'factor')?.align, 'left');
assert.equal(physicalSaved.find((column) => column.key === 'propagation')?.align, 'center');
assert.equal(physicalSaved.find((column) => column.key === 'propagation')?.contentOrientation, 'HORIZONTAL');
assert.notEqual(physicalSaved.find((column) => column.key === 'symptoms')?.weight, 16);
assert.equal(physicalSaved.find((column) => column.key === 'symptoms')?.weight, 40);
assert.ok(Math.abs(percentSum('PHYSICAL_CHEMICAL', physicalPreference) - 100) < 0.001);
assert.ok(Math.abs(percentSum('OTHER', otherPreference) - 100) < 0.001);
assert.notEqual(
  physicalSaved.find((column) => column.key === 'symptoms')?.percent,
  otherSaved.find((column) => column.key === 'symptoms')?.percent,
);

const restored = riskTechnicalLayouts('PHYSICAL_CHEMICAL', null);
assert.equal(restored.find((column) => column.key === 'factor')?.contentOrientation, 'HORIZONTAL');
assert.equal(restored.find((column) => column.key === 'factor')?.weight, 10);
assert.equal(restored.find((column) => column.key === 'factor')?.align, 'left');
assert.deepEqual(
  risksForTechnicalGroup(rows, 'PHYSICAL_CHEMICAL').map((item) => item.id),
  ['fis', 'qui'],
);

const legacyOther: RiskTechnicalColumnsPreference = {
  version: 1,
  columns: RISK_TECHNICAL_OTHER_COLUMNS.filter((column) => column.key !== 'type').map((column) => ({
    key: column.key,
    orientation: column.key === 'factor' ? ('VERTICAL' as const) : column.orientation,
    ...(column.headerOrientation ? { headerOrientation: column.headerOrientation } : {}),
    widthWeight: column.key === 'effects' ? 40 : column.key === 'propagation' ? 7 : column.widthWeight,
  })),
};
const legacyLayouts = riskTechnicalLayouts('OTHER', legacyOther);
assert.equal(legacyLayouts[0]?.key, 'type');
assert.equal(legacyLayouts.find((column) => column.key === 'type')?.weight, 1);
assert.equal(legacyLayouts.find((column) => column.key === 'type')?.contentOrientation, 'VERTICAL');
assert.equal(legacyLayouts.find((column) => column.key === 'type')?.headerOrientation, 'VERTICAL');
assert.equal(legacyLayouts.find((column) => column.key === 'factor')?.contentOrientation, 'VERTICAL');
assert.equal(legacyLayouts.find((column) => column.key === 'factor')?.weight, 14);
assert.equal(legacyLayouts.find((column) => column.key === 'propagation')?.weight, 7);
assert.equal(legacyLayouts.find((column) => column.key === 'propagation')?.headerOrientation, 'VERTICAL');
assert.equal(legacyLayouts.find((column) => column.key === 'effects')?.weight, 40);
assert.ok(Math.abs(legacyLayouts.reduce((sum, column) => sum + column.percent, 0) - 100) < 0.001);
assert.equal(riskTechnicalCellText(rows[0], 'factor'), 'Ruído');
assert.equal(gridSource.includes("column.key === 'type'"), true);
assert.equal(gridSource.includes('resolveRiskChip'), true);
assert.equal(gridSource.includes('STagRisk'), false);
assert.equal(gridSource.includes("column.key === 'factor'"), false);

assert.equal(viewSource.includes('Configurar colunas'), true);
assert.equal(gridSource.includes("tableLayout: 'fixed'"), true);
assert.equal(gridSource.includes("width: '100%'"), true);
assert.equal(dialogSource.includes('Restaurar padrão'), true);
assert.equal(dialogSource.includes('Definir como padrão do sistema'), true);
assert.equal(dialogSource.includes('SAuthShow'), true);
assert.equal(dialogSource.includes('RoleEnum.MASTER'), true);
assert.equal(dialogSource.includes('título personalizado'), false);
assert.equal(dialogSource.includes('Mostrar conteúdo'), true);
assert.equal(dialogSource.includes('<Switch'), true);

const hiddenPe: RiskTechnicalColumnsPreference = {
  version: 1,
  columns: RISK_TECHNICAL_PHYSICAL_COLUMNS.map((column) => ({
    key: column.key,
    orientation: column.orientation,
    ...(column.headerOrientation ? { headerOrientation: column.headerOrientation } : {}),
    widthWeight: column.widthWeight,
    ...(column.key === 'pe' ? { visible: false as const } : {}),
  })),
};
assert.equal(riskTechnicalColumnVisible(null, 'pe'), true);
assert.equal(riskTechnicalColumnVisible(hiddenPe, 'factor'), true);
assert.equal(riskTechnicalColumnVisible(hiddenPe, 'pe'), false);
const hiddenLayouts = riskTechnicalLayouts('PHYSICAL_CHEMICAL', hiddenPe);
assert.equal(hiddenLayouts.some((column) => column.key === 'pe'), false);
assert.equal(hiddenLayouts.length, RISK_TECHNICAL_PHYSICAL_COLUMNS.length - 1);
assert.ok(Math.abs(hiddenLayouts.reduce((sum, column) => sum + column.percent, 0) - 100) < 0.001);
assert.equal(hiddenPe.columns.find((column) => column.key === 'pe')?.widthWeight, 2);
assert.equal(hiddenPe.columns.find((column) => column.key === 'factor')?.widthWeight, 10);
assert.equal(hiddenLayouts.find((column) => column.key === 'factor')?.weight, 10);
const otherUntouched = riskTechnicalLayouts('OTHER', null);
assert.equal(otherUntouched.length, RISK_TECHNICAL_OTHER_COLUMNS.length);
assert.equal(otherUntouched.some((column) => column.key === 'propagation'), true);

const restoredPe = riskTechnicalLayouts('PHYSICAL_CHEMICAL', {
  version: 1,
  columns: hiddenPe.columns.map((column) => (column.key === 'pe' ? { ...column, visible: true } : column)),
});
assert.equal(restoredPe.find((column) => column.key === 'pe')?.weight, 2);
assert.equal(restoredPe.some((column) => column.key === 'pe'), true);
assert.ok(Math.abs(restoredPe.reduce((sum, column) => sum + column.percent, 0) - 100) < 0.001);

console.log('risk-technical-data presentation spec ok');
