/**
 * Cobertura efetiva de cargos dos Elementos Caracterizados.
 * Executar:
 * npx tsx src/@v2/pages/companies/characterizations/components/CharacterizationTable/characterization-office-coverage.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import {
  buildGseCargoModalView,
  buildGseCargoTabRows,
  GseCoverageNode,
} from 'core/utils/gse-effective-office-membership.util';

import {
  formatCharacterizationCargoTooltipLines,
  officesForSelectedEstablishment,
  summarizeEffectiveOfficeCoverage,
} from './characterization-office-coverage.util';

const matriz = ['matriz'];

function node(
  id: string,
  type: string,
  parentId: string | null,
  name = id,
  workspaceIds: string[] = matriz,
): GseCoverageNode {
  return { id, type, parentId, name, workspaceIds, companyId: 'company' };
}

const pintura = [
  node('dir', HierarchyEnum.DIRECTORY, null, 'DIRETORIA'),
  node('ger', HierarchyEnum.MANAGEMENT, 'dir', 'GERENCIA'),
  node('setor', HierarchyEnum.SECTOR, 'ger', 'PINTURA'),
  node('p1', HierarchyEnum.OFFICE, 'setor', 'PINTOR I'),
  node('p2', HierarchyEnum.OFFICE, 'setor', 'PINTOR II'),
  node('p3', HierarchyEnum.OFFICE, 'setor', 'PINTOR III'),
  node('p4', HierarchyEnum.OFFICE, 'setor', 'PINTOR IV'),
  node('dev', HierarchyEnum.SUB_OFFICE, 'p1', 'PINTOR I TURNO'),
  node('vazio', HierarchyEnum.SECTOR, 'ger', 'SETOR VAZIO'),
  node('soldador', HierarchyEnum.OFFICE, 'ger', 'SOLDADOR'),
  node(
    'ref-pintor',
    HierarchyEnum.OFFICE,
    'setor',
    'PINTOR REFINARIA',
    ['refinaria'],
  ),
];

const sectorSummary = summarizeEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'setor' }],
  workspaceId: 'matriz',
});
assert.equal(sectorSummary.effectiveOfficeCount, 4);
assert.equal(sectorSummary.directOfficeCount, 0);
assert.equal(sectorSummary.inheritedOfficeCount, 4);
assert.equal(sectorSummary.inheritedOfficeOrigins.length, 1);
assert.equal(sectorSummary.inheritedOfficeOrigins[0].sourceName, 'PINTURA');
assert.equal(
  sectorSummary.inheritedOfficeOrigins[0].sourceType,
  HierarchyEnum.SECTOR,
);

const directSummary = summarizeEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'soldador' }],
  workspaceId: 'matriz',
});
assert.equal(directSummary.effectiveOfficeCount, 1);
assert.equal(directSummary.directOfficeCount, 1);
assert.equal(directSummary.inheritedOfficeCount, 0);

const overlap = summarizeEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'setor' }, { hierarchyId: 'p1' }],
  workspaceId: 'matriz',
});
assert.equal(overlap.effectiveOfficeCount, 4);
assert.equal(overlap.directOfficeCount, 1);
assert.equal(overlap.inheritedOfficeCount, 3);

const emptySector = summarizeEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'vazio' }],
  workspaceId: 'matriz',
});
assert.equal(emptySector.effectiveOfficeCount, 0);
const emptyModal = buildGseCargoModalView({
  nodes: pintura,
  modalSelectIds: ['vazio//matriz'],
  workspaceId: 'matriz',
});
assert.deepEqual(emptyModal.explicitModalIds, ['vazio//matriz']);
assert.deepEqual(emptyModal.orphanExplicitModalIds, ['vazio//matriz']);
assert.deepEqual(emptyModal.selected, []);

const removed = summarizeEffectiveOfficeCoverage({
  nodes: pintura,
  links: [],
  workspaceId: 'matriz',
});
assert.equal(removed.effectiveOfficeCount, 0);
assert.equal(removed.inheritedOfficeCount, 0);
const removedModal = buildGseCargoModalView({
  nodes: pintura,
  modalSelectIds: [],
  workspaceId: 'matriz',
});
assert.deepEqual(removedModal.explicitModalIds, []);
assert.deepEqual(removedModal.selected, []);

const individual = buildGseCargoModalView({
  nodes: pintura,
  modalSelectIds: ['soldador//matriz'],
  workspaceId: 'matriz',
});
assert.deepEqual(individual.explicitModalIds, ['soldador//matriz']);
assert.equal(
  individual.selected.every((office) => office.officeId === 'soldador'),
  true,
);
assert.equal(
  individual.explicitModalIds.some((id) => id.startsWith('p1')),
  false,
);
assert.deepEqual(
  individual.explicitModalIds.map((id) => id.split('//')[0]),
  ['soldador'],
);

const sectorModal = buildGseCargoModalView({
  nodes: pintura,
  modalSelectIds: ['setor//matriz'],
  workspaceId: 'matriz',
});
assert.deepEqual(sectorModal.explicitModalIds, ['setor//matriz']);
assert.equal(sectorModal.selected.length, 4);
assert.equal(
  sectorModal.selected.every((office) => office.origin === 'inherited'),
  true,
);
assert.equal(
  sectorModal.selected.every(
    (office) => office.removeModalId === 'setor//matriz',
  ),
  true,
);
const inheritedOfficeIds = ['p1//matriz', 'p2//matriz', 'p3//matriz', 'p4//matriz'];
inheritedOfficeIds.forEach((modalId) => {
  assert.equal(sectorModal.explicitModalIds.includes(modalId), false);
  assert.equal(sectorModal.availableOfficeModalIds.includes(modalId), false);
});

const overlapModal = buildGseCargoModalView({
  nodes: pintura,
  modalSelectIds: ['setor//matriz', 'p1//matriz'],
  workspaceId: 'matriz',
});
assert.deepEqual(overlapModal.explicitModalIds, ['setor//matriz', 'p1//matriz']);
assert.equal(overlapModal.selected.length, 4);
assert.equal(
  overlapModal.explicitModalIds.filter((id) => id.startsWith('p')).length,
  1,
);

const otherWorkspace = summarizeEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'setor' }],
  workspaceId: 'refinaria',
});
assert.equal(otherWorkspace.effectiveOfficeCount, 1);
assert.equal(otherWorkspace.inheritedOfficeOrigins[0].sourceName, 'PINTURA');
const emptyWorkspace = summarizeEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'setor' }],
  workspaceId: 'moeve',
});
assert.equal(emptyWorkspace.effectiveOfficeCount, 0);
const matrizOnly = summarizeEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'setor' }],
  workspaceId: 'matriz',
});
assert.equal(matrizOnly.effectiveOfficeCount, 4);

const subOffice = summarizeEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'dev' }],
  workspaceId: 'matriz',
});
assert.equal(subOffice.effectiveOfficeCount, 0);
const subOfficeModal = buildGseCargoModalView({
  nodes: pintura,
  modalSelectIds: ['dev//matriz'],
  workspaceId: 'matriz',
});
assert.deepEqual(subOfficeModal.selected, []);
assert.deepEqual(subOfficeModal.orphanExplicitModalIds, ['dev//matriz']);
assert.deepEqual(subOfficeModal.explicitModalIds, ['dev//matriz']);

const tabRows = buildGseCargoTabRows({
  nodes: officesForSelectedEstablishment(pintura, 'matriz'),
  hierarchies: [
    {
      id: 'setor',
      hierarchyOnHomogeneous: [{ id: 10, hierarchyId: 'setor', endDate: null }],
    },
  ],
  gseWorkspaceIds: ['matriz'],
  workspaceNamesById: { matriz: 'Matriz' },
});
assert.equal(tabRows.length, 4);
assert.equal(
  tabRows.every((row) => row.linkId === 10 && row.origin === 'inherited'),
  true,
);
assert.equal(
  tabRows.some((row) => row.id.startsWith('ref-pintor')),
  false,
);
assert.equal(
  tabRows.some((row) => row.name.includes('TURNO')),
  false,
);

const tooltip = formatCharacterizationCargoTooltipLines({
  summary: sectorSummary,
  explicitHierarchies: [{ name: 'PINTURA', type: HierarchyEnum.SECTOR }],
  typeLabels: { [HierarchyEnum.SECTOR]: 'Setor' },
});
assert.equal(tooltip.includes('4 cargos abrangidos'), true);
assert.equal(tooltip.includes('Origem indireta: Setor PINTURA'), true);
assert.equal(tooltip.includes('Vínculos explícitos:'), true);
assert.equal(tooltip.includes('(Setor) PINTURA'), true);

const dialogSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationCargoManagerDialog.tsx',
  ),
  'utf8',
);
assert.equal(dialogSource.includes('buildGseCargoTabRows'), true);
assert.equal(dialogSource.includes('invalidateCharacterizationInventory'), true);
assert.equal(dialogSource.includes('gseCargoSelect'), false);
assert.equal(
  dialogSource.includes(
    "hierarchyIds: selected.map((h) => String(h.id).split('//')[0])",
  ),
  true,
);

const tableSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/characterizations/components/CharacterizationTable/CharacterizationTable.tsx',
  ),
  'utf8',
);
assert.equal(tableSource.split('useQueryHierarchies(').length - 1, 1);
assert.equal(tableSource.includes('summarizeEffectiveOfficeCoverage'), true);
assert.equal(
  tableSource.includes('CharacterizationOrderByEnum.HIERARCHY'),
  true,
);

const presentationSource = readFileSync(
  resolve(
    'src/@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable.tsx',
  ),
  'utf8',
);
assert.equal(presentationSource.includes('useQueryHierarchies'), false);
assert.equal(presentationSource.includes('officeCoverageById'), true);
assert.equal(presentationSource.includes('showZeroCount'), true);
assert.equal(presentationSource.includes('orderDisabled'), true);
assert.equal(presentationSource.includes('.sort('), false);

const gseTableSource = readFileSync(
  resolve('src/components/organisms/tables/GhosTable/GhosTable.tsx'),
  'utf8',
);
assert.equal(gseTableSource.includes('effectiveOfficeCount ?? 0'), true);
assert.equal(gseTableSource.includes('formatGseOfficeCountLines'), true);

const gseHookSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddGHO/hooks/useAddGho.ts'),
  'utf8',
);
assert.equal(gseHookSource.includes('buildGseCargoModalView'), false);
assert.equal(gseHookSource.includes('resolveEffectiveOfficeCoverage'), false);

const selectSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalSelectHierarchy/SelectData/index.tsx',
  ),
  'utf8',
);
assert.equal(
  selectSource.includes('if (!isGseCargoSelect || !workspaceSelected?.id)'),
  true,
);
assert.equal(selectSource.includes('noteGseCargoUserEdit'), true);
const characterizationSelectAll = selectSource.slice(
  selectSource.indexOf('if (isCharacterizationCargoSelect) {'),
  selectSource.indexOf('if (isCharacterizationCargoSelect) {') + 500,
);
assert.equal(
  characterizationSelectAll.includes('characterizationAvailableOfficeIds.has'),
  true,
);
assert.equal(characterizationSelectAll.includes('noteGseCargoUserEdit'), false);

const invalidateSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/invalidate-characterization-inventory.ts',
  ),
  'utf8',
);
assert.equal(
  invalidateSource.includes('QueryKeyCharacterizationEnum.CHARACTERIZATIONS'),
  true,
);

console.log('characterization-office-coverage.util.spec.ts ok');
