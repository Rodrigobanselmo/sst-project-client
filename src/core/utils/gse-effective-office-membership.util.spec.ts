/**
 * Abrangência efetiva de OFFICE no client.
 * Executar:
 * npx tsx src/core/utils/gse-effective-office-membership.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';

import {
  buildGseCargoModalView,
  buildGseCargoTabRows,
  formatGseOfficeCountLines,
  layoutGseCargoTabRows,
  resolveEffectiveOfficeCoverage,
  GseCoverageNode,
} from './gse-effective-office-membership.util';

const ws = ['matriz'];

function node(
  id: string,
  type: string,
  parentId: string | null,
  name = id,
  workspaceIds: string[] = ws,
): GseCoverageNode {
  return { id, type, parentId, name, workspaceIds, companyId: 'company' };
}

const pintura = [
  node('dir', HierarchyEnum.DIRECTORY, null, 'DIRETORIA'),
  node('ger', HierarchyEnum.MANAGEMENT, 'dir', 'GERENCIA'),
  node('setor', HierarchyEnum.SECTOR, 'ger', 'PINTURA'),
  node('sub', HierarchyEnum.SUB_SECTOR, 'setor', 'CABINE'),
  node('p1', HierarchyEnum.OFFICE, 'setor', 'PINTOR I'),
  node('p2', HierarchyEnum.OFFICE, 'setor', 'PINTOR II'),
  node('p3', HierarchyEnum.OFFICE, 'setor', 'PINTOR III'),
  node('p4', HierarchyEnum.OFFICE, 'setor', 'PINTOR IV'),
  node('dev', HierarchyEnum.SUB_OFFICE, 'p1', 'PINTOR I TURNO'),
  node('outro-setor', HierarchyEnum.SECTOR, 'ger', 'SOLDA'),
  node('soldador', HierarchyEnum.OFFICE, 'outro-setor', 'SOLDADOR'),
];

function ids(rows: { officeId: string }[]) {
  return rows.map((row) => row.officeId);
}

const sectorOnly = resolveEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'setor', linkId: 10 }],
  workspaceId: 'matriz',
});
assert.deepEqual(ids(sectorOnly), ['p1', 'p2', 'p3', 'p4']);
assert.equal(sectorOnly.every((row) => row.origin === 'inherited'), true);
assert.equal(sectorOnly.every((row) => row.sourceHierarchyId === 'setor'), true);
assert.equal(ids(sectorOnly).includes('dev'), false);

const direct = resolveEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'soldador', linkId: 2 }],
  workspaceId: 'matriz',
});
assert.deepEqual(ids(direct), ['soldador']);
assert.equal(direct[0].origin, 'direct');

const sectorPlusOther = resolveEffectiveOfficeCoverage({
  nodes: pintura,
  links: [
    { hierarchyId: 'setor', linkId: 10 },
    { hierarchyId: 'soldador', linkId: 2 },
  ],
  workspaceId: 'matriz',
});
assert.deepEqual(ids(sectorPlusOther), ['p1', 'p2', 'p3', 'p4', 'soldador']);

const duplicated = resolveEffectiveOfficeCoverage({
  nodes: pintura,
  links: [
    { hierarchyId: 'setor', linkId: 10 },
    { hierarchyId: 'p1', linkId: 11 },
  ],
  workspaceId: 'matriz',
});
assert.deepEqual(ids(duplicated), ['p1', 'p2', 'p3', 'p4']);
assert.equal(duplicated.find((row) => row.officeId === 'p1')?.origin, 'direct');
assert.equal(
  duplicated.find((row) => row.officeId === 'p1')?.sourceHierarchyId,
  'p1',
);
assert.equal(
  duplicated.find((row) => row.officeId === 'p2')?.sourceHierarchyId,
  'setor',
);

const bySubsector = resolveEffectiveOfficeCoverage({
  nodes: [...pintura, node('cabine-1', HierarchyEnum.OFFICE, 'sub', 'PINTOR CABINE')],
  links: [{ hierarchyId: 'sub', linkId: 8 }],
  workspaceId: 'matriz',
});
assert.deepEqual(ids(bySubsector), ['cabine-1']);
assert.equal(bySubsector[0].origin, 'inherited');
assert.equal(bySubsector[0].sourceHierarchyId, 'sub');

const byDirectory = resolveEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'dir', linkId: 1 }],
  workspaceId: 'matriz',
});
assert.deepEqual(ids(byDirectory), ['p1', 'p2', 'p3', 'p4', 'soldador']);
assert.equal(byDirectory.every((row) => row.sourceHierarchyId === 'dir'), true);

const byManagement = resolveEffectiveOfficeCoverage({
  nodes: pintura,
  links: [{ hierarchyId: 'ger', linkId: 3 }],
  workspaceId: 'matriz',
});
assert.equal(byManagement.every((row) => row.sourceHierarchyId === 'ger'), true);

const nearest = resolveEffectiveOfficeCoverage({
  nodes: pintura,
  links: [
    { hierarchyId: 'dir', linkId: 1 },
    { hierarchyId: 'setor', linkId: 10 },
  ],
  workspaceId: 'matriz',
});
assert.equal(nearest.find((row) => row.officeId === 'p1')?.sourceHierarchyId, 'setor');
assert.equal(
  nearest.find((row) => row.officeId === 'soldador')?.sourceHierarchyId,
  'dir',
);

assert.deepEqual(
  ids(
    resolveEffectiveOfficeCoverage({
      nodes: pintura,
      links: [{ hierarchyId: 'setor', linkId: 10, endDate: '2020-01-01' }],
      workspaceId: 'matriz',
    }),
  ),
  [],
);
assert.deepEqual(
  ids(
    resolveEffectiveOfficeCoverage({
      nodes: pintura,
      links: [{ hierarchyId: 'setor', linkId: 10, deletedAt: '2020-01-01' }],
      workspaceId: 'matriz',
    }),
  ),
  [],
);

const createdLater = resolveEffectiveOfficeCoverage({
  nodes: [...pintura, node('p5', HierarchyEnum.OFFICE, 'setor', 'PINTOR V')],
  links: [{ hierarchyId: 'setor', linkId: 10 }],
  workspaceId: 'matriz',
});
assert.equal(createdLater.find((row) => row.officeId === 'p5')?.origin, 'inherited');

const tabRows = buildGseCargoTabRows({
  nodes: pintura,
  gseWorkspaceIds: ['matriz'],
  workspaceNamesById: { matriz: 'Matriz' },
  hierarchies: [
    {
      id: 'setor',
      hierarchyOnHomogeneous: [
        { id: 10, hierarchyId: 'setor', endDate: null as unknown as Date, startDate: null as unknown as Date },
      ],
    },
  ],
});
assert.equal(tabRows.length, 4);
assert.equal(tabRows.every((row) => row.type === HierarchyEnum.OFFICE), true);
assert.equal(tabRows.some((row) => row.name === 'PINTURA'), false);
assert.equal(tabRows[0].workspaceGroupName, 'Matriz');
assert.equal(tabRows[0].sectorGroupName, 'PINTURA');
assert.equal(tabRows.every((row) => row.canUnlinkSource === false), true);
assert.equal(tabRows.some((row) => row.name === 'PINTOR I TURNO'), false);

const tabLayout = layoutGseCargoTabRows(tabRows);
const pinturaLink = tabLayout.find((row) => row.kind === 'link');
assert.equal(pinturaLink?.kind, 'link');
if (pinturaLink?.kind === 'link') {
  assert.equal(pinturaLink.displayName, 'PINTURA');
  assert.equal(pinturaLink.linkId, 10);
  assert.equal(pinturaLink.canUnlink, true);
  assert.equal(pinturaLink.origin, 'inherited');
}
const coveredNames = tabLayout
  .filter((row) => row.kind === 'covered')
  .map((row) => (row.kind === 'covered' ? row.name : ''));
assert.deepEqual(coveredNames, ['PINTOR I', 'PINTOR II', 'PINTOR III', 'PINTOR IV']);
assert.equal(
  tabLayout
    .filter((row) => row.kind === 'covered')
    .every(
      (row) =>
        row.kind === 'covered' &&
        row.originLabel === 'Abrangido pelo vínculo com o Setor PINTURA',
    ),
  true,
);

const modalIds = ['setor//matriz', 'soldador//matriz'];
const modalView = buildGseCargoModalView({
  nodes: pintura,
  modalSelectIds: modalIds,
  workspaceId: 'matriz',
});
assert.deepEqual(modalView.explicitModalIds, modalIds);
assert.equal(modalView.availableOfficeModalIds.includes('p1//matriz'), false);
assert.equal(modalView.availableOfficeModalIds.includes('dev//matriz'), false);
assert.equal(modalView.selected.length, 5);
const inherited = modalView.selected.find((row) => row.officeId === 'p1');
assert.equal(inherited?.origin, 'inherited');
assert.equal(inherited?.removeModalId, 'setor//matriz');
assert.notEqual(inherited?.removeModalId, inherited?.modalId);
assert.equal(modalView.explicitModalIds.includes('p1//matriz'), false);
const directModal = modalView.selected.find((row) => row.officeId === 'soldador');
assert.equal(directModal?.origin, 'direct');
assert.equal(directModal?.removeModalId, 'soldador//matriz');
const ancestorGroup = modalView.groups.find((group) => group.kind === 'ancestor');
const directGroup = modalView.groups.find((group) => group.kind === 'direct');
assert.equal(ancestorGroup?.kind, 'ancestor');
if (ancestorGroup?.kind === 'ancestor') {
  assert.equal(ancestorGroup.sourceName, 'PINTURA');
  assert.equal(ancestorGroup.sourceModalId, 'setor//matriz');
  assert.deepEqual(
    ancestorGroup.offices.map((office) => office.officeId),
    ['p1', 'p2', 'p3', 'p4'],
  );
  assert.equal(
    ancestorGroup.offices.every((office) => office.modalId !== ancestorGroup.sourceModalId),
    true,
  );
}
assert.equal(directGroup?.kind, 'direct');
if (directGroup?.kind === 'direct') {
  assert.equal(directGroup.officeId, 'soldador');
  assert.equal(directGroup.sourceModalId, 'soldador//matriz');
}

assert.deepEqual(
  formatGseOfficeCountLines({
    effectiveOfficeCount: 4,
    directOfficeCount: 0,
    inheritedOfficeCount: 4,
    inheritedOfficeOrigins: [
      {
        sourceHierarchyId: 'setor',
        sourceType: HierarchyEnum.SECTOR,
        sourceName: 'PINTURA',
        count: 4,
      },
    ],
  }),
  [
    '4 cargos abrangidos',
    '0 por vínculo direto',
    '4 por vínculo indireto',
    'Origem indireta: Setor PINTURA',
  ],
);
assert.deepEqual(
  formatGseOfficeCountLines({
    effectiveOfficeCount: 7,
    directOfficeCount: 2,
    inheritedOfficeCount: 5,
    inheritedOfficeOrigins: [
      {
        sourceHierarchyId: 'setor',
        sourceType: HierarchyEnum.SECTOR,
        sourceName: 'PINTURA',
        count: 3,
      },
      {
        sourceHierarchyId: 'solda',
        sourceType: HierarchyEnum.SECTOR,
        sourceName: 'SOLDAGEM',
        count: 2,
      },
    ],
  }),
  [
    '7 cargos abrangidos',
    '2 por vínculo direto',
    '5 por vínculo indireto',
    'Origem indireta:',
    '3 pelo Setor PINTURA',
    '2 pelo Setor SOLDAGEM',
  ],
);

const subOfficeOnly = buildGseCargoModalView({
  nodes: pintura,
  modalSelectIds: ['dev//matriz'],
  workspaceId: 'matriz',
});
assert.deepEqual(subOfficeOnly.selected, []);
assert.deepEqual(subOfficeOnly.orphanExplicitModalIds, ['dev//matriz']);
assert.deepEqual(subOfficeOnly.explicitModalIds, ['dev//matriz']);

const tableSource = readFileSync(
  resolve('src/components/organisms/tables/GhosTable/GhosTable.tsx'),
  'utf8',
);
assert.equal(tableSource.includes('effectiveOfficeCount ?? 0'), true);
assert.equal(tableSource.includes('formatGseOfficeCountLines'), true);
assert.equal(tableSource.includes('hierarchyCount'), false);

const hookSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddGHO/hooks/useAddGho.ts'),
  'utf8',
);
assert.equal(hookSource.includes('mapModalSelectIdsToGhoLinks'), true);
assert.equal(hookSource.includes('resolveEffectiveOfficeCoverage'), false);
assert.equal(hookSource.includes('buildGseCargoModalView'), false);

const characterizationSource = readFileSync(
  resolve(
    'src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationCargoManagerDialog.tsx',
  ),
  'utf8',
);
assert.equal(characterizationSource.includes('buildGseCargoTabRows'), true);
assert.equal(characterizationSource.includes('coverageRows'), true);
assert.equal(characterizationSource.includes('characterizationCargoSelect: true'), true);
assert.equal(characterizationSource.includes('forceCargoFilter: true'), true);
assert.equal(characterizationSource.includes('gseCargoSelect'), false);
assert.equal(
  characterizationSource.includes(
    "hierarchyIds: selected.map((h) => String(h.id).split('//')[0])",
  ),
  true,
);

const selectSource = readFileSync(
  resolve('src/components/organisms/modals/ModalSelectHierarchy/SelectData/index.tsx'),
  'utf8',
);
assert.equal(
  selectSource.includes('toCharacterizationCargoModalRow(hierarchy)'),
  true,
);
assert.equal(selectSource.includes('buildGseCargoModalView'), true);
assert.equal(selectSource.includes('if (!isGseCargoSelect || !workspaceSelected?.id)'), true);
assert.equal(selectSource.includes('characterizationAvailableOfficeIds'), true);

console.log('gse-effective-office-membership.util.spec.ts ok');
