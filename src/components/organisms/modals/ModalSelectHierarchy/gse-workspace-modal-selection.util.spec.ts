/**
 * npx tsx src/components/organisms/modals/ModalSelectHierarchy/gse-workspace-modal-selection.util.spec.ts
 */
import assert from 'node:assert/strict';

import { mapModalSelectIdsToGhoLinks } from '../ModalAddGHO/hooks/ghoHierarchyLinks';
import {
  filterModalIdsByWorkspace,
  keepModalIdsOutsideWorkspace,
  mergeCurrentWorkspaceSelection,
  partitionGseModalColumns,
  uniqueModalIds,
} from './gse-workspace-modal-selection.util';

const catalogA = [
  'cargo-a1//ws-a',
  'cargo-a2//ws-a',
  'cargo-a-other-gse//ws-a',
];
const catalogB = ['cargo-b1//ws-b'];

const persisted = [
  'cargo-a1//ws-a',
  'cargo-b1//ws-b',
];

const openInA = partitionGseModalColumns({
  currentWorkspaceId: 'ws-a',
  catalogIdsInCurrentWorkspace: catalogA,
  modalSelectIds: persisted,
});

assert.deepEqual(openInA.leftIds, ['cargo-a2//ws-a', 'cargo-a-other-gse//ws-a']);
assert.deepEqual(openInA.rightIds, ['cargo-a1//ws-a']);
assert.deepEqual(openInA.hiddenPreservedIds, ['cargo-b1//ws-b']);
assert.equal(
  openInA.leftIds.includes('cargo-a-other-gse//ws-a'),
  true,
  'cargo de A em outro GSE permanece selecionável',
);
assert.equal(
  openInA.leftIds.includes('cargo-b1//ws-b') ||
    openInA.rightIds.includes('cargo-b1//ws-b'),
  false,
  'vínculo de B não aparece nas colunas de A',
);

const afterRemoveA1 = mergeCurrentWorkspaceSelection(persisted, 'ws-a', []);
assert.deepEqual(afterRemoveA1, ['cargo-b1//ws-b']);
assert.deepEqual(mapModalSelectIdsToGhoLinks(afterRemoveA1), [
  { id: 'cargo-b1', workspaceId: 'ws-b' },
]);

const afterAddAllA = uniqueModalIds([...persisted, ...catalogA]);
assert.deepEqual(afterAddAllA, [
  'cargo-a1//ws-a',
  'cargo-b1//ws-b',
  'cargo-a2//ws-a',
  'cargo-a-other-gse//ws-a',
]);

const afterAddA2 = mergeCurrentWorkspaceSelection(persisted, 'ws-a', [
  'cargo-a1//ws-a',
  'cargo-a2//ws-a',
]);
assert.deepEqual(afterAddA2, [
  'cargo-b1//ws-b',
  'cargo-a1//ws-a',
  'cargo-a2//ws-a',
]);
assert.deepEqual(mapModalSelectIdsToGhoLinks(afterAddA2), [
  { id: 'cargo-b1', workspaceId: 'ws-b' },
  { id: 'cargo-a1', workspaceId: 'ws-a' },
  { id: 'cargo-a2', workspaceId: 'ws-a' },
]);

const afterRemoveAllA = keepModalIdsOutsideWorkspace(persisted, 'ws-a');
assert.deepEqual(afterRemoveAllA, ['cargo-b1//ws-b']);

const openInB = partitionGseModalColumns({
  currentWorkspaceId: 'ws-b',
  catalogIdsInCurrentWorkspace: catalogB,
  modalSelectIds: persisted,
});
assert.deepEqual(openInB.leftIds, []);
assert.deepEqual(openInB.rightIds, ['cargo-b1//ws-b']);
assert.deepEqual(openInB.hiddenPreservedIds, ['cargo-a1//ws-a']);

assert.deepEqual(filterModalIdsByWorkspace(persisted, 'ws-a'), [
  'cargo-a1//ws-a',
]);

console.log('gse-workspace-modal-selection.util.spec.ts ok');
