/**
 * Executar: npx tsx --tsconfig tsconfig.json src/components/organisms/main/Tree/OrgTree/utils/attach-establishment-group-layer.spec.ts
 */
import assert from 'node:assert/strict';

import { firstNodeId } from 'core/constants/first-node-id.constant';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap } from '../interfaces';
import {
  attachEstablishmentGroupLayer,
  isEstablishmentGroupTreeId,
  toEstablishmentGroupTreeId,
  UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID,
} from './attach-establishment-group-layer';
import { canCopyHierarchyNode, getCopyHierarchyDestinationOptions, isHierarchyCopyDropAllowed } from './get-copy-hierarchy-destinations';
import { getWorkspaceIdFromTreeNode } from './get-org-workspace-id';
import { filterTreeMapByWorkspace } from './filter-tree-map-by-workspace';

function node(
  partial: Pick<
    ITreeMap[string],
    'id' | 'label' | 'parentId' | 'childrenIds' | 'type'
  >,
): ITreeMap[string] {
  return { ...partial, expand: true, ghos: [] };
}

function companyWorkspaceTree(): ITreeMap {
  return {
    [firstNodeId]: node({
      id: firstNodeId,
      label: 'Empresa',
      parentId: null,
      childrenIds: ['ws-a', 'ws-b', 'ws-c'],
      type: TreeTypeEnum.COMPANY,
    }),
    'ws-a': node({
      id: 'ws-a',
      label: 'A',
      parentId: firstNodeId,
      childrenIds: ['cargo-a//ws-a'],
      type: TreeTypeEnum.WORKSPACE,
    }),
    'ws-b': node({
      id: 'ws-b',
      label: 'B',
      parentId: firstNodeId,
      childrenIds: ['cargo-b//ws-b'],
      type: TreeTypeEnum.WORKSPACE,
    }),
    'ws-c': node({
      id: 'ws-c',
      label: 'C',
      parentId: firstNodeId,
      childrenIds: [],
      type: TreeTypeEnum.WORKSPACE,
    }),
    'cargo-a//ws-a': node({
      id: 'cargo-a//ws-a',
      label: 'Cargo A',
      parentId: 'ws-a',
      childrenIds: [],
      type: TreeTypeEnum.OFFICE,
    }),
    'cargo-b//ws-b': node({
      id: 'cargo-b//ws-b',
      label: 'Cargo B',
      parentId: 'ws-b',
      childrenIds: [],
      type: TreeTypeEnum.OFFICE,
    }),
  };
}

const withoutGroups = attachEstablishmentGroupLayer(companyWorkspaceTree(), {
  groups: [],
  workspaces: [
    { id: 'ws-a', establishmentGroupId: null },
    { id: 'ws-b', establishmentGroupId: null },
    { id: 'ws-c', establishmentGroupId: null },
  ],
});
assert.deepEqual(withoutGroups.seed.childrenIds, ['ws-a', 'ws-b', 'ws-c']);
assert.equal(withoutGroups['ws-a'].parentId, firstNodeId);

const withGroups = attachEstablishmentGroupLayer(companyWorkspaceTree(), {
  groups: [
    { id: 'g-braskem', name: 'BRASKEM', sortOrder: 0, status: 'ACTIVE' as never },
    { id: 'g-empty', name: 'Vazio', sortOrder: 1, status: 'ACTIVE' as never },
    { id: 'g-other', name: 'Outro', sortOrder: 2, status: 'ACTIVE' as never },
  ],
  workspaces: [
    { id: 'ws-a', establishmentGroupId: 'g-braskem' },
    { id: 'ws-b', establishmentGroupId: 'g-other' },
    { id: 'ws-c', establishmentGroupId: null },
  ],
});

const braskemId = toEstablishmentGroupTreeId('g-braskem');
const otherId = toEstablishmentGroupTreeId('g-other');
const emptyId = toEstablishmentGroupTreeId('g-empty');

assert.deepEqual(withGroups.seed.childrenIds, [
  braskemId,
  otherId,
  UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID,
]);
assert.equal(withGroups[emptyId], undefined);
assert.deepEqual(withGroups[braskemId].childrenIds, ['ws-a']);
assert.deepEqual(withGroups[otherId].childrenIds, ['ws-b']);
assert.deepEqual(withGroups[UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID].childrenIds, [
  'ws-c',
]);
assert.equal(withGroups['ws-a'].parentId, braskemId);
assert.equal(withGroups['ws-b'].parentId, otherId);
assert.equal(withGroups['ws-c'].parentId, UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID);
assert.equal(withGroups['cargo-a//ws-a'].parentId, 'ws-a');
assert.equal(
  getWorkspaceIdFromTreeNode(withGroups[UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID]),
  '',
);

const withUnknownGroup = attachEstablishmentGroupLayer(companyWorkspaceTree(), {
  groups: [
    { id: 'g-braskem', name: 'BRASKEM', sortOrder: 0, status: 'ACTIVE' as never },
  ],
  workspaces: [
    { id: 'ws-a', establishmentGroupId: 'g-braskem' },
    { id: 'ws-b', establishmentGroupId: 'missing-group' },
    { id: 'ws-c', establishmentGroupId: null },
  ],
});
assert.deepEqual(withUnknownGroup.seed.childrenIds, [
  braskemId,
  UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID,
]);
assert.deepEqual(
  withUnknownGroup[UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID].childrenIds,
  ['ws-b', 'ws-c'],
);
assert.equal(withUnknownGroup['ws-b'].label, 'B');
assert.equal(withUnknownGroup['ws-c'].label, 'C');

assert.equal(getWorkspaceIdFromTreeNode(withGroups['cargo-a//ws-a']), 'ws-a');
assert.equal(getWorkspaceIdFromTreeNode(withGroups['ws-a']), 'ws-a');
assert.equal(getWorkspaceIdFromTreeNode(withGroups[braskemId]), '');
assert.equal(getWorkspaceIdFromTreeNode(withGroups[firstNodeId]), '');
assert.equal(isEstablishmentGroupTreeId(braskemId), true);

assert.equal(canCopyHierarchyNode(withGroups[braskemId]), false);
assert.equal(
  canCopyHierarchyNode(withGroups[UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID]),
  false,
);
assert.equal(
  isHierarchyCopyDropAllowed({
    source: withGroups['cargo-a//ws-a'],
    target: withGroups[braskemId],
    nodes: withGroups,
  }),
  false,
);
assert.equal(
  isHierarchyCopyDropAllowed({
    source: withGroups[braskemId],
    target: withGroups['ws-b'],
    nodes: withGroups,
  }),
  false,
);

const single = filterTreeMapByWorkspace(withGroups, ['ws-b']);
assert.deepEqual(single.seed.childrenIds, [otherId]);
assert.deepEqual(single[otherId].childrenIds, ['ws-b']);

const multi = filterTreeMapByWorkspace(withGroups, ['ws-a', 'ws-c']);
assert.deepEqual(multi.seed.childrenIds, [
  braskemId,
  UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID,
]);

const copyDestinations = getCopyHierarchyDestinationOptions({
  source: withGroups['cargo-a//ws-a'],
  nodes: withGroups,
});
assert.equal(
  copyDestinations.some((item) => isEstablishmentGroupTreeId(item.treeId)),
  false,
);

console.log('attach-establishment-group-layer.spec.ts OK');
