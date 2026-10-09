/**
 * Estados visuais do seletor hierárquico unificado.
 * Executar:
 * npx tsx src/components/organisms/modals/ModalSelectHierarchy/hierarchy-link-tree.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { HierarchyEnum } from 'core/enums/hierarchy.enum';
import { resolveEffectiveOfficeCoverage } from 'core/utils/gse-effective-office-membership.util';

import {
  buildHierarchyLinkTreeModel,
  expandHierarchyLinkSearchPaths,
  formatHierarchyLinkSelectionSummary,
  resolveHierarchyLinkTreeVisibility,
  toggleHierarchyLinkSelection,
} from './hierarchy-link-tree.util';
import { pruneRedundantHierarchyModalIds } from './structure-hierarchy-selection.util';

const nodes = [
  { id: 'dir', type: HierarchyEnum.DIRECTORY, parentId: null, workspaceIds: ['matriz'], name: 'DIRETORIA INDUSTRIAL' },
  { id: 'ger', type: HierarchyEnum.MANAGEMENT, parentId: 'dir', workspaceIds: ['matriz'], name: 'GERÊNCIA DE PRODUÇÃO' },
  { id: 'setor', type: HierarchyEnum.SECTOR, parentId: 'ger', workspaceIds: ['matriz'], name: 'SETOR PINTURA' },
  { id: 'p1', type: HierarchyEnum.OFFICE, parentId: 'setor', workspaceIds: ['matriz'], name: 'PINTOR I' },
  { id: 'p2', type: HierarchyEnum.OFFICE, parentId: 'setor', workspaceIds: ['matriz'], name: 'PINTOR II' },
  { id: 'p3', type: HierarchyEnum.OFFICE, parentId: 'setor', workspaceIds: ['matriz'], name: 'PINTOR III' },
  { id: 'p4', type: HierarchyEnum.OFFICE, parentId: 'setor', workspaceIds: ['matriz'], name: 'PINTOR IV' },
  { id: 'dev', type: HierarchyEnum.SUB_OFFICE, parentId: 'p1', workspaceIds: ['matriz'], name: 'TURNO A' },
  { id: 'solda-setor', type: HierarchyEnum.SECTOR, parentId: 'ger', workspaceIds: ['matriz'], name: 'SETOR SOLDAGEM' },
  { id: 'soldador', type: HierarchyEnum.OFFICE, parentId: 'solda-setor', workspaceIds: ['matriz'], name: 'SOLDADOR' },
  { id: 'vazio', type: HierarchyEnum.SECTOR, parentId: 'dir', workspaceIds: ['matriz'], name: 'SETOR VAZIO' },
  { id: 'ref-setor', type: HierarchyEnum.SECTOR, parentId: 'dir', workspaceIds: ['refinaria'], name: 'SETOR REFINARIA' },
  { id: 'ref-office', type: HierarchyEnum.OFFICE, parentId: 'ref-setor', workspaceIds: ['refinaria'], name: 'OPERADOR' },
  { id: 'matriz-root', type: 'WORKSPACE', parentId: null, workspaceIds: ['matriz'], name: 'MATRIZ' },
];

const view = (modalSelectIds: string[], workspaceId = 'matriz') =>
  buildHierarchyLinkTreeModel({ nodes, modalSelectIds, workspaceId });

const state = (modalSelectIds: string[], id: string, workspaceId = 'matriz') =>
  view(modalSelectIds, workspaceId).rows.find((row) => row.id === id)?.visualState;

const toggle = (modalSelectIds: string[], nodeId: string, workspaceId = 'matriz') =>
  toggleHierarchyLinkSelection({ nodes, modalSelectIds, workspaceId, nodeId });

const idsOf = (modalSelectIds: string[]) =>
  view(modalSelectIds).rows.map((row) => row.id);

assert.deepEqual(idsOf([]).includes('matriz-root'), false);
assert.deepEqual(idsOf([]), [
  'dir',
  'ger',
  'setor',
  'p1',
  'dev',
  'p2',
  'p3',
  'p4',
  'solda-setor',
  'soldador',
  'vazio',
]);
assert.equal(view([]).rows.find((row) => row.id === 'p1')?.depth, 3);
assert.equal(view([], 'refinaria').rows.some((row) => row.id === 'p1'), false);
assert.equal(view([], 'refinaria').rows.some((row) => row.id === 'ref-office'), true);

assert.deepEqual(toggle([], 'p1'), ['p1//matriz']);
assert.equal(state(['p1//matriz'], 'p1'), 'explicit');
assert.equal(state(['p1//matriz'], 'p2'), 'available');
assert.equal(state(['p1//matriz'], 'setor'), 'partial');
assert.equal(view(['p1//matriz']).rows.find((row) => row.id === 'setor')?.selectable, true);
assert.equal(
  view(['p1//matriz']).explicitCount,
  1,
);
assert.equal(view(['p1//matriz']).coveredOfficeCount, 1);

assert.deepEqual(toggle([], 'setor'), ['setor//matriz']);
const sectorView = view(['setor//matriz']);
assert.equal(state(['setor//matriz'], 'setor'), 'explicit');
assert.equal(sectorView.rows.filter((row) => row.visualState === 'inherited').map((row) => row.id).sort().join(), 'p1,p2,p3,p4');
assert.equal(state(['setor//matriz'], 'dev'), 'available');
assert.equal(sectorView.explicitCount, 1);
assert.equal(sectorView.coveredOfficeCount, 4);
assert.equal(sectorView.summary, '1 vínculo explícito · 4 cargos abrangidos');
['p1//matriz', 'p2//matriz', 'p3//matriz', 'p4//matriz'].forEach((modalId) => {
  assert.equal(sectorView.rows.some((row) => row.modalId === modalId && row.visualState === 'explicit'), false);
});

const afterSector = toggle(['p1//matriz'], 'setor');
assert.deepEqual(afterSector, ['setor//matriz']);
assert.equal(state(afterSector, 'p1'), 'inherited');
assert.equal(afterSector.includes('p1//matriz'), false);

assert.deepEqual(toggle([], 'dir'), ['dir//matriz']);
assert.equal(state(['dir//matriz'], 'dir'), 'explicit');
assert.equal(state(['dir//matriz'], 'ger'), 'contained');
assert.equal(state(['dir//matriz'], 'setor'), 'contained');
assert.equal(state(['dir//matriz'], 'vazio'), 'contained');
assert.equal(state(['dir//matriz'], 'soldador'), 'inherited');
assert.equal(state(['dir//matriz'], 'dev'), 'available');
assert.equal(view(['dir//matriz']).coveredOfficeCount, 5);
assert.equal(
  view(['dir//matriz']).rows.filter((row) => row.visualState === 'contained' || row.visualState === 'inherited').every((row) => row.selectable === false),
  true,
);

const keptDeveloped = toggle(['dir//matriz', 'dev//matriz'], 'p1');
assert.deepEqual(keptDeveloped, ['dir//matriz', 'dev//matriz']);
assert.equal(state(['dir//matriz', 'dev//matriz'], 'dev'), 'explicit');

const removedSector = toggle(['setor//matriz', 'soldador//matriz'], 'setor');
assert.deepEqual(removedSector, ['soldador//matriz']);
assert.equal(state(removedSector, 'p1'), 'available');
assert.equal(removedSector.includes('p1//matriz'), false);
assert.equal(removedSector.includes('p2//matriz'), false);

assert.deepEqual(toggle(toggle([], 'p1'), 'p3'), ['p1//matriz', 'p3//matriz']);
const partial = view(['p1//matriz', 'p3//matriz']);
assert.equal(state(['p1//matriz', 'p3//matriz'], 'setor'), 'partial');
assert.equal(state(['p1//matriz', 'p3//matriz'], 'ger'), 'partial');
assert.equal(state(['p1//matriz', 'p3//matriz'], 'dir'), 'partial');
assert.equal(partial.rows.find((row) => row.id === 'setor')?.modalId && partial.explicitCount, 2);
['setor//matriz', 'ger//matriz', 'dir//matriz'].forEach((modalId) => {
  assert.equal(['p1//matriz', 'p3//matriz'].includes(modalId), false);
});
assert.deepEqual(toggle(['p1//matriz', 'p3//matriz'], 'setor'), ['setor//matriz']);

assert.deepEqual(toggle([], 'vazio'), ['vazio//matriz']);
assert.equal(state(['vazio//matriz'], 'vazio'), 'explicit');
assert.equal(view(['vazio//matriz']).coveredOfficeCount, 0);
assert.equal(view(['vazio//matriz']).summary, '1 vínculo explícito · 0 cargos abrangidos');

const matrizOnly = view(['setor//matriz'], 'refinaria');
assert.equal(matrizOnly.rows.some((row) => row.id === 'p1'), false);
assert.equal(state(['setor//matriz'], 'ref-office', 'refinaria'), 'available');
assert.equal(matrizOnly.coveredOfficeCount, 0);
assert.deepEqual(toggle(['setor//matriz'], 'ref-setor', 'refinaria'), [
  'setor//matriz',
  'ref-setor//refinaria',
]);
assert.equal(
  view(['setor//matriz', 'ref-setor//refinaria'], 'matriz').coveredOfficeCount,
  4,
);
assert.equal(
  view(['setor//matriz', 'ref-setor//refinaria'], 'refinaria').coveredOfficeCount,
  1,
);

assert.deepEqual(toggle(['p1//matriz'], 'p1'), []);
assert.deepEqual(toggle(['setor//matriz'], 'p1'), ['setor//matriz']);
assert.deepEqual(toggle(['dir//matriz'], 'ger'), ['dir//matriz']);

const developedOnly = toggle(['p1//matriz'], 'dev');
assert.deepEqual(developedOnly, ['p1//matriz', 'dev//matriz']);
assert.equal(state(developedOnly, 'p1'), 'explicit');
assert.equal(state(developedOnly, 'setor'), 'partial');
assert.equal(view(['dev//matriz']).coveredOfficeCount, 0);
assert.equal(state(['dev//matriz'], 'p1'), 'available');
assert.equal(state(['dev//matriz'], 'setor'), 'available');

const coverage = resolveEffectiveOfficeCoverage({
  nodes,
  workspaceId: 'matriz',
  links: [{ hierarchyId: 'setor' }],
});
assert.equal(view(['setor//matriz']).coveredOfficeCount, coverage.length);

assert.equal(
  formatHierarchyLinkSelectionSummary(2, 8),
  '2 vínculos explícitos · 8 cargos abrangidos',
);

const open = resolveHierarchyLinkTreeVisibility({
  rows: view([]).rows,
  collapsedIds: [],
  search: '',
});
assert.equal(open.visibleRows.length, view([]).rows.length);
assert.equal(open.expandedIds.includes('setor'), true);

const collapsed = resolveHierarchyLinkTreeVisibility({
  rows: view(['p1//matriz']).rows,
  collapsedIds: ['setor'],
  search: '',
});
assert.equal(collapsed.visibleRows.some((row) => row.id === 'p1'), false);
assert.equal(collapsed.visibleRows.find((row) => row.id === 'setor')?.visualState, 'partial');
assert.deepEqual(
  collapsed.visibleRows.map((row) => row.visualState),
  view(['p1//matriz']).rows.filter((row) => collapsed.visibleRows.some((visible) => visible.id === row.id)).map((row) => row.visualState),
);

const searchRows = view(['setor//matriz']).rows;
const openedBySearch = expandHierarchyLinkSearchPaths(
  searchRows,
  ['dir', 'ger', 'setor'],
  'pintor',
);
assert.equal(openedBySearch.includes('setor'), false);
assert.equal(openedBySearch.includes('dir'), false);
const found = resolveHierarchyLinkTreeVisibility({
  rows: searchRows,
  collapsedIds: openedBySearch,
  search: 'pintor',
});
assert.deepEqual(
  found.visibleRows.map((row) => row.id),
  ['dir', 'ger', 'setor', 'p1', 'dev', 'p2', 'p3', 'p4'],
);
assert.equal(found.expandedIds.includes('setor'), true);
assert.equal(found.visibleRows.some((row) => row.id === 'soldador'), false);
assert.equal(found.visibleRows.find((row) => row.id === 'p1')?.visualState, 'inherited');
const foldedDuringSearch = resolveHierarchyLinkTreeVisibility({
  rows: searchRows,
  collapsedIds: ['setor'],
  search: 'pintor',
});
assert.equal(foldedDuringSearch.visibleRows.some((row) => row.id === 'dir'), true);
assert.equal(foldedDuringSearch.visibleRows.some((row) => row.id === 'p1'), false);

const accent = resolveHierarchyLinkTreeVisibility({
  rows: view([]).rows,
  collapsedIds: [],
  search: 'producao',
});
assert.equal(accent.visibleRows.some((row) => row.id === 'ger'), true);
assert.equal(accent.visibleRows.some((row) => row.id === 'soldador'), true);

const unknownPruned = pruneRedundantHierarchyModalIds(
  ['setor//matriz', 'novo-dev//matriz'],
  nodes,
);
assert.equal(unknownPruned.includes('novo-dev//matriz'), true);
assert.equal(unknownPruned.includes('setor//matriz'), true);

const utilSource = readFileSync(
  resolve('src/components/organisms/modals/ModalSelectHierarchy/hierarchy-link-tree.util.ts'),
  'utf8',
);
assert.equal(utilSource.includes('resolveEffectiveOfficeCoverage('), true);
assert.equal(utilSource.includes("origin: sourceId === officeId"), false);

const selectSource = readFileSync(
  resolve('src/components/organisms/modals/ModalSelectHierarchy/SelectData/index.tsx'),
  'utf8',
);
assert.equal(selectSource.includes('isUnifiedHierarchyTree'), true);
assert.equal(selectSource.includes('<HierarchyLinkTree'), true);
assert.equal(selectSource.includes("visualState === 'inherited'"), true);
assert.equal(selectSource.includes("visualState === 'partial'"), true);
assert.equal(selectSource.includes('keepModalIdsOutsideWorkspace'), true);
const removeBranch = selectSource.slice(
  selectSource.indexOf('const removeUnifiedExplicitLink'),
  selectSource.indexOf('const removeUnifiedExplicitLink') + 320,
);
assert.equal(removeBranch.includes('noteGseCargoUserEdit'), true);
assert.equal(
  removeBranch.indexOf('noteGseCargoUserEdit') < removeBranch.indexOf('setModalIds'),
  true,
);
assert.equal(selectSource.includes('hierarchyList.map((hierarchy) =>'), true);
assert.equal(selectSource.includes('!isUnifiedHierarchyTree'), true);

const treeSource = readFileSync(
  resolve('src/components/organisms/modals/ModalSelectHierarchy/HierarchyLinkTree.tsx'),
  'utf8',
);
assert.equal(treeSource.includes('Expandir todos'), true);
assert.equal(treeSource.includes('Recolher todos'), true);
assert.equal(treeSource.includes('Pesquisar por nome'), true);
assert.equal(treeSource.includes("text={'Funcionários'}"), true);
assert.equal(treeSource.includes('aria-checked'), true);
assert.equal(treeSource.includes('resolveEffectiveOfficeCoverage'), false);
assert.equal(treeSource.includes('DocumentRiskFilterModal'), false);
assert.equal(treeSource.includes('OrgTree'), false);
assert.equal(treeSource.includes('setModalIds'), false);

const inputSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalSelectHierarchy/SelectData/ModalInputHierarchy/index.tsx',
  ),
  'utf8',
);
assert.equal(inputSource.includes("text={'Funcionários'}"), true);

console.log('hierarchy-link-tree.util.spec.ts ok');
