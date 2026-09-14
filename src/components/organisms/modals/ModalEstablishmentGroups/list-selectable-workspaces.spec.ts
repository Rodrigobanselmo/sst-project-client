/**
 * Executar: npx tsx --tsconfig tsconfig.json src/components/organisms/modals/ModalEstablishmentGroups/list-selectable-workspaces.spec.ts
 */
import assert from 'node:assert/strict';

import { listSelectableWorkspacesForEstablishmentGroup } from './list-selectable-workspaces';

const braskem = { id: 'g-braskem', name: 'BRASKEM' };
const corteva = { id: 'g-corteva', name: 'CORTEVA' };

const workspaces = [
  { id: 'pe2', name: 'BRASKEM PE2', establishmentGroupId: 'g-braskem' },
  { id: 'livre-z', name: 'ZZ Livre', establishmentGroupId: null },
  { id: 'pe1', name: 'BRASKEM PE1', establishmentGroupId: 'g-braskem' },
  { id: 'corteva-1', name: 'CORTEVA SP', establishmentGroupId: 'g-corteva' },
  { id: 'pe3', name: 'braskem pe3', establishmentGroupId: 'g-braskem' },
  { id: 'petro-1', name: 'PETROBRAS Macaé', establishmentGroupId: null },
  { id: 'livre-a', name: 'AA Livre', establishmentGroupId: null },
];

const groupByWorkspaceId = new Map(
  workspaces
    .filter((workspace) => workspace.establishmentGroupId)
    .map((workspace) => [
      workspace.id,
      workspace.establishmentGroupId === 'g-braskem' ? braskem : corteva,
    ]),
);

const creating = listSelectableWorkspacesForEstablishmentGroup({
  workspaces,
  groupByWorkspaceId,
});
assert.deepEqual(
  creating.map((workspace) => workspace.id),
  ['livre-a', 'petro-1', 'livre-z'],
);
assert.equal(
  creating.some((workspace) => workspace.establishmentGroupId === 'g-braskem'),
  false,
);
assert.equal(
  creating.some((workspace) => workspace.id === 'corteva-1'),
  false,
);

const editingBraskem = listSelectableWorkspacesForEstablishmentGroup({
  workspaces,
  groupByWorkspaceId,
  currentGroupId: 'g-braskem',
});
assert.deepEqual(
  editingBraskem.map((workspace) => workspace.id),
  ['livre-a', 'pe1', 'pe2', 'pe3', 'petro-1', 'livre-z'],
);
assert.equal(
  editingBraskem.some((workspace) => workspace.id === 'corteva-1'),
  false,
);
assert.deepEqual(
  editingBraskem
    .filter((workspace) => workspace.establishmentGroupId === 'g-braskem')
    .map((workspace) => workspace.id),
  ['pe1', 'pe2', 'pe3'],
);

const source = [...workspaces];
listSelectableWorkspacesForEstablishmentGroup({
  workspaces: source,
  groupByWorkspaceId,
  currentGroupId: 'g-braskem',
});
assert.equal(source[0].id, 'pe2');

console.log('list-selectable-workspaces.spec.ts OK');
