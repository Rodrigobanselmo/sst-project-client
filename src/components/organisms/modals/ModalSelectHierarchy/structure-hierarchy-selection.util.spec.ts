/**
 * Seleção de estrutura nos modais de cargo.
 * Executar:
 * npx tsx src/components/organisms/modals/ModalSelectHierarchy/structure-hierarchy-selection.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { buildGseCargoModalView } from 'core/utils/gse-effective-office-membership.util';

import {
  indexStructureNodes,
  isOrganizationalStructure,
  pruneRedundantHierarchyModalIds,
  structureAppliesToWorkspace,
  structureBlockedByAncestor,
  STRUCTURE_FILTER,
} from './structure-hierarchy-selection.util';

const nodes = [
  { id: 'dir', type: HierarchyEnum.DIRECTORY, parentId: null, workspaceIds: ['matriz'], name: 'DIRETORIA' },
  { id: 'ger', type: HierarchyEnum.MANAGEMENT, parentId: 'dir', workspaceIds: ['matriz'], name: 'GERENCIA' },
  { id: 'setor', type: HierarchyEnum.SECTOR, parentId: 'ger', workspaceIds: ['matriz'], name: 'PINTURA' },
  { id: 'p1', type: HierarchyEnum.OFFICE, parentId: 'setor', workspaceIds: ['matriz'], name: 'PINTOR I' },
  { id: 'p2', type: HierarchyEnum.OFFICE, parentId: 'setor', workspaceIds: ['matriz'], name: 'PINTOR II' },
  { id: 'p3', type: HierarchyEnum.OFFICE, parentId: 'setor', workspaceIds: ['matriz'], name: 'PINTOR III' },
  { id: 'p4', type: HierarchyEnum.OFFICE, parentId: 'setor', workspaceIds: ['matriz'], name: 'PINTOR IV' },
  { id: 'dev', type: HierarchyEnum.SUB_OFFICE, parentId: 'p1', workspaceIds: ['matriz'], name: 'TURNO' },
  { id: 'soldador', type: HierarchyEnum.OFFICE, parentId: 'ger', workspaceIds: ['matriz'], name: 'SOLDADOR' },
  { id: 'ref-setor', type: HierarchyEnum.SECTOR, parentId: 'ger', workspaceIds: ['refinaria'], name: 'OUTRO' },
  { id: 'ref-office', type: HierarchyEnum.OFFICE, parentId: 'ref-setor', workspaceIds: ['refinaria'], name: 'OUTRO CARGO' },
];

assert.equal(isOrganizationalStructure(HierarchyEnum.SECTOR), true);
assert.equal(isOrganizationalStructure(HierarchyEnum.DIRECTORY), true);
assert.equal(isOrganizationalStructure(HierarchyEnum.OFFICE), false);
assert.equal(isOrganizationalStructure(HierarchyEnum.SUB_OFFICE), false);

const indexed = indexStructureNodes(nodes);
assert.equal(
  structureAppliesToWorkspace('setor', indexed.byId, indexed.childrenById, 'matriz'),
  true,
);
assert.equal(
  structureAppliesToWorkspace('ref-setor', indexed.byId, indexed.childrenById, 'matriz'),
  false,
);
assert.equal(
  structureAppliesToWorkspace('dir', indexed.byId, indexed.childrenById, 'refinaria'),
  true,
);

const explicit = new Set(['dir']);
assert.equal(structureBlockedByAncestor('setor', explicit, indexed.byId), true);
assert.equal(structureBlockedByAncestor('dir', explicit, indexed.byId), false);

const sectorOnly = pruneRedundantHierarchyModalIds(['setor//matriz'], nodes);
assert.deepEqual(sectorOnly, ['setor//matriz']);
const sectorView = buildGseCargoModalView({
  nodes,
  modalSelectIds: sectorOnly,
  workspaceId: 'matriz',
});
assert.deepEqual(sectorView.explicitModalIds, ['setor//matriz']);
assert.equal(sectorView.selected.length, 4);
assert.equal(sectorView.selected.every((office) => office.origin === 'inherited'), true);
assert.equal(
  sectorView.selected.every((office) => office.removeModalId === 'setor//matriz'),
  true,
);
['p1//matriz', 'p2//matriz', 'p3//matriz', 'p4//matriz'].forEach((modalId) => {
  assert.equal(sectorView.explicitModalIds.includes(modalId), false);
});

const withFutureOffice = buildGseCargoModalView({
  nodes: [
    ...nodes,
    {
      id: 'p5',
      type: HierarchyEnum.OFFICE,
      parentId: 'setor',
      workspaceIds: ['matriz'],
      name: 'PINTOR V',
    },
  ],
  modalSelectIds: ['setor//matriz'],
  workspaceId: 'matriz',
});
assert.equal(withFutureOffice.explicitModalIds.length, 1);
assert.equal(withFutureOffice.selected.length, 5);
assert.equal(
  withFutureOffice.selected.some((office) => office.officeId === 'p5'),
  true,
);

const directory = pruneRedundantHierarchyModalIds(
  ['setor//matriz', 'p1//matriz', 'soldador//matriz', 'dev//matriz', 'dir//matriz'],
  nodes,
);
assert.deepEqual(directory, ['dev//matriz', 'dir//matriz']);
const directoryView = buildGseCargoModalView({
  nodes,
  modalSelectIds: ['dir//matriz'],
  workspaceId: 'matriz',
});
assert.deepEqual(directoryView.explicitModalIds, ['dir//matriz']);
assert.equal(directoryView.selected.length, 5);

const removed = buildGseCargoModalView({
  nodes,
  modalSelectIds: [],
  workspaceId: 'matriz',
});
assert.deepEqual(removed.selected, []);
assert.deepEqual(removed.explicitModalIds, []);

const individual = pruneRedundantHierarchyModalIds(['soldador//matriz'], nodes);
assert.deepEqual(individual, ['soldador//matriz']);

const otherEstablishment = pruneRedundantHierarchyModalIds(
  ['ref-setor//refinaria', 'dir//matriz'],
  nodes,
);
assert.deepEqual(otherEstablishment, ['ref-setor//refinaria', 'dir//matriz']);

const selectSource = readFileSync(
  resolve('src/components/organisms/modals/ModalSelectHierarchy/SelectData/index.tsx'),
  'utf8',
);
const structureBranch = selectSource.slice(
  selectSource.indexOf('const selectStructures'),
  selectSource.indexOf('const selectStructures') + 500,
);
assert.equal(structureBranch.includes('noteGseCargoUserEdit'), true);
assert.equal(structureBranch.includes('pruneRedundantHierarchyModalIds'), true);
assert.equal(selectSource.includes('STRUCTURE_COVERAGE_TOOLTIP'), true);
const placeholderBranch = selectSource.slice(
  selectSource.indexOf('placeholder={'),
  selectSource.indexOf('placeholder={') + 280,
);
assert.equal(placeholderBranch.includes('filter === STRUCTURE_FILTER'), true);
assert.equal(placeholderBranch.includes('Nome da estrutura...'), true);
assert.equal(
  placeholderBranch.indexOf('filter === STRUCTURE_FILTER') <
    placeholderBranch.indexOf('hierarchyConstant[filter].placeholder'),
  true,
);
assert.equal(selectSource.includes('onEmployeeAdd'), true);
assert.equal(selectSource.includes("text={'Funcionários'}"), false);

const inputSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalSelectHierarchy/SelectData/ModalInputHierarchy/index.tsx',
  ),
  'utf8',
);
assert.equal(inputSource.includes('Estrutura'), true);
assert.equal(inputSource.includes('STRUCTURE_COVERAGE_TOOLTIP'), true);
assert.equal(inputSource.includes("text={'Funcionários'}"), true);

const organogramSource = readFileSync(
  resolve(
    'src/components/organisms/main/Tree/OrgTree/components/RenderCard/components/NodeCard/index.tsx',
  ),
  'utf8',
);
assert.equal(organogramSource.includes('getHierarchyIdFromTreeId(hierarchy)'), true);
assert.equal(organogramSource.includes('pruneRedundantHierarchyModalIds'), false);

console.log('structure-hierarchy-selection.util.spec.ts ok');
