/**
 * Executar: npx tsx --tsconfig tsconfig.json src/components/organisms/main/Tree/OrgTree/utils/get-org-workspace-id.spec.ts
 */
import assert from 'node:assert/strict';

import { firstNodeId } from 'core/constants/first-node-id.constant';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap } from '../interfaces';
import { buildCopyHierarchyBranchPayload } from './get-copy-hierarchy-destinations';
import {
  getEmbeddedWorkspaceIdFromTreeId,
  getWorkspaceIdFromTreeNode,
  isCrossWorkspaceHierarchyMove,
  resolveHierarchyUpsertParentId,
  resolveOrgWorkspaceNodeFromId,
  resolveWorkspaceIdForTreeEdit,
  treeNodeCoversWorkspace,
} from './get-org-workspace-id';

function node(
  partial: Pick<
    ITreeMap[string],
    'id' | 'label' | 'parentId' | 'childrenIds' | 'type'
  >,
): ITreeMap[string] {
  return { ...partial, expand: true, ghos: [] };
}

const tree: ITreeMap = {
  [firstNodeId]: node({
    id: firstNodeId,
    label: 'Empresa',
    parentId: null,
    childrenIds: ['ws-a', 'ws-b'],
    type: TreeTypeEnum.COMPANY,
  }),
  'ws-a': node({
    id: 'ws-a',
    label: 'Matriz',
    parentId: firstNodeId,
    childrenIds: ['sector-1//ws-a'],
    type: TreeTypeEnum.WORKSPACE,
  }),
  'ws-b': node({
    id: 'ws-b',
    label: 'Filial',
    parentId: firstNodeId,
    childrenIds: ['sector-b//ws-b'],
    type: TreeTypeEnum.WORKSPACE,
  }),
  'sector-1//ws-a': node({
    id: 'sector-1//ws-a',
    label: 'Produção',
    parentId: 'ws-a',
    childrenIds: ['office-1//ws-a'],
    type: TreeTypeEnum.SECTOR,
  }),
  'office-1//ws-a': node({
    id: 'office-1//ws-a',
    label: 'Operador',
    parentId: 'sector-1//ws-a',
    childrenIds: [],
    type: TreeTypeEnum.OFFICE,
  }),
  'sector-b//ws-b': node({
    id: 'sector-b//ws-b',
    label: 'Outro setor',
    parentId: 'ws-b',
    childrenIds: [],
    type: TreeTypeEnum.SECTOR,
  }),
};

const office = tree['office-1//ws-a'];
const workspaceA = tree['ws-a'];
const company = tree[firstNodeId];

assert.equal(getEmbeddedWorkspaceIdFromTreeId(office.id), 'ws-a');
assert.equal(getWorkspaceIdFromTreeNode(office), 'ws-a');
assert.equal(
  getWorkspaceIdFromTreeNode({
    id: 'deep-node//ws-a',
    type: TreeTypeEnum.OFFICE,
    parentId: 'not-a-workspace',
  }),
  'ws-a',
);

assert.equal(getWorkspaceIdFromTreeNode(workspaceA), 'ws-a');
assert.equal(
  getWorkspaceIdFromTreeNode({
    id: 'ws-a',
    type: TreeTypeEnum.WORKSPACE,
    parentId: firstNodeId,
  }),
  'ws-a',
);

assert.equal(getWorkspaceIdFromTreeNode(company), '');
assert.equal(getEmbeddedWorkspaceIdFromTreeId(company.id), '');

const addUnderWorkspace = resolveWorkspaceIdForTreeEdit(
  { id: 'new-card//ws-a', type: TreeTypeEnum.SECTOR, parentId: 'ws-a' },
  tree,
);
assert.equal(addUnderWorkspace, 'ws-a');
assert.equal(
  resolveHierarchyUpsertParentId({
    treeParentId: 'ws-a',
    workspaceId: addUnderWorkspace,
  }),
  null,
);

const addUnderSector = resolveWorkspaceIdForTreeEdit(
  {
    id: 'new-office//ws-a',
    type: TreeTypeEnum.OFFICE,
    parentId: 'sector-1//ws-a',
  },
  tree,
);
assert.equal(addUnderSector, 'ws-a');
assert.equal(
  resolveHierarchyUpsertParentId({
    treeParentId: 'sector-1//ws-a',
    workspaceId: addUnderSector,
  }),
  'sector-1',
);

const createUnderWorkspaceParent = getWorkspaceIdFromTreeNode(workspaceA);
assert.equal(createUnderWorkspaceParent, 'ws-a');
assert.equal(
  getWorkspaceIdFromTreeNode(tree['sector-1//ws-a']),
  'ws-a',
);

const copyAB = buildCopyHierarchyBranchPayload({
  source: office,
  target: tree['sector-b//ws-b'],
});
assert.deepEqual(copyAB, {
  sourceHierarchyId: 'office-1',
  sourceWorkspaceId: 'ws-a',
  targetParentId: 'sector-b',
  targetWorkspaceId: 'ws-b',
});

const copyAA = buildCopyHierarchyBranchPayload({
  source: office,
  target: tree['sector-1//ws-a'],
});
assert.equal(copyAA.sourceWorkspaceId, 'ws-a');
assert.equal(copyAA.targetWorkspaceId, 'ws-a');

const copyRootB = buildCopyHierarchyBranchPayload({
  source: tree['sector-1//ws-a'],
  target: workspaceA,
});
assert.equal(copyRootB.targetWorkspaceId, 'ws-a');
assert.equal(copyRootB.targetParentId, null);

assert.equal(
  isCrossWorkspaceHierarchyMove(
    resolveOrgWorkspaceNodeFromId('ws-a', tree),
    resolveOrgWorkspaceNodeFromId('ws-b', tree),
  ),
  true,
);
assert.equal(
  isCrossWorkspaceHierarchyMove(
    resolveOrgWorkspaceNodeFromId('sector-1//ws-a', tree),
    resolveOrgWorkspaceNodeFromId('ws-a', tree),
  ),
  false,
);
assert.equal(
  isCrossWorkspaceHierarchyMove(
    resolveOrgWorkspaceNodeFromId(firstNodeId, tree),
    resolveOrgWorkspaceNodeFromId('ws-a', tree),
  ),
  true,
);
assert.equal(
  isCrossWorkspaceHierarchyMove(
    { id: 'office-1//ws-a', type: TreeTypeEnum.OFFICE, parentId: 'sector-1//ws-a' },
    { id: 'sector-b//ws-b', type: TreeTypeEnum.SECTOR, parentId: 'ws-b' },
  ),
  true,
);

assert.equal(treeNodeCoversWorkspace(tree, 'ws-a', 'ws-a'), true);
assert.equal(treeNodeCoversWorkspace(tree, 'ws-a', 'ws-b'), false);
assert.equal(treeNodeCoversWorkspace(tree, firstNodeId, 'ws-b'), true);

const nested: ITreeMap = {
  [firstNodeId]: node({
    id: firstNodeId,
    label: 'Empresa',
    parentId: null,
    childrenIds: ['container'],
    type: TreeTypeEnum.COMPANY,
  }),
  container: node({
    id: 'container',
    label: 'Container',
    parentId: firstNodeId,
    childrenIds: ['ws-a', 'ws-b'],
    type: TreeTypeEnum.DIRECTORY,
  }),
  'ws-a': node({
    id: 'ws-a',
    label: 'A',
    parentId: 'container',
    childrenIds: [],
    type: TreeTypeEnum.WORKSPACE,
  }),
  'ws-b': node({
    id: 'ws-b',
    label: 'B',
    parentId: 'container',
    childrenIds: [],
    type: TreeTypeEnum.WORKSPACE,
  }),
};
assert.equal(treeNodeCoversWorkspace(nested, 'container', 'ws-b'), true);
assert.equal(getWorkspaceIdFromTreeNode(nested.container), '');

assert.equal(
  getWorkspaceIdFromTreeNode({
    id: 'establishment-group:g1',
    type: TreeTypeEnum.ESTABLISHMENT_GROUP,
    parentId: firstNodeId,
  }),
  '',
);
assert.equal(
  getWorkspaceIdFromTreeNode({
    id: 'establishment-group:ungrouped',
    type: TreeTypeEnum.ESTABLISHMENT_GROUP,
    parentId: firstNodeId,
  }),
  '',
);
assert.equal(
  resolveOrgWorkspaceNodeFromId('establishment-group:g1').type,
  TreeTypeEnum.ESTABLISHMENT_GROUP,
);
assert.equal(
  resolveHierarchyUpsertParentId({
    treeParentId: 'establishment-group:g1',
    workspaceId: 'ws-a',
  }),
  null,
);
assert.equal(
  resolveHierarchyUpsertParentId({
    treeParentId: 'establishment-group:ungrouped',
    workspaceId: 'ws-a',
  }),
  null,
);

console.log('get-org-workspace-id.spec.ts OK');
