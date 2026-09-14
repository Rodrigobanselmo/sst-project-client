/**
 * Executar: npx tsx --tsconfig tsconfig.json src/components/organisms/main/Tree/OrgTree/utils/get-copy-hierarchy-destinations.spec.ts
 */
import assert from 'node:assert/strict';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap } from '../interfaces';
import {
  buildCopyHierarchyBranchPayload,
  canCopyHierarchyNode,
  formatCopyHierarchyDestinationLabel,
  getCopyHierarchyDestinationOptions,
  isHierarchyCopyDropAllowed,
  isSameHierarchyWorkspace,
} from './get-copy-hierarchy-destinations';

function node(
  partial: Pick<
    ITreeMap[string],
    'id' | 'label' | 'parentId' | 'childrenIds' | 'type'
  >,
): ITreeMap[string] {
  return { ...partial, expand: true, ghos: [] };
}

const tree: ITreeMap = {
  company: node({
    id: 'company',
    label: 'Empresa',
    parentId: null,
    childrenIds: ['ws-a', 'ws-b'],
    type: TreeTypeEnum.COMPANY,
  }),
  'ws-a': node({
    id: 'ws-a',
    label: 'Matriz',
    parentId: 'company',
    childrenIds: ['dir-1//ws-a', 'sector-1//ws-a'],
    type: TreeTypeEnum.WORKSPACE,
  }),
  'ws-b': node({
    id: 'ws-b',
    label: 'Filial',
    parentId: 'company',
    childrenIds: ['sector-b//ws-b'],
    type: TreeTypeEnum.WORKSPACE,
  }),
  'dir-1//ws-a': node({
    id: 'dir-1//ws-a',
    label: 'Industrial',
    parentId: 'ws-a',
    childrenIds: ['sector-2//ws-a'],
    type: TreeTypeEnum.DIRECTORY,
  }),
  'sector-1//ws-a': node({
    id: 'sector-1//ws-a',
    label: 'Produção',
    parentId: 'ws-a',
    childrenIds: ['office-1//ws-a'],
    type: TreeTypeEnum.SECTOR,
  }),
  'sector-2//ws-a': node({
    id: 'sector-2//ws-a',
    label: 'Qualidade',
    parentId: 'dir-1//ws-a',
    childrenIds: [],
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

assert.equal(
  canCopyHierarchyNode({ id: 'office-1//ws-a', type: TreeTypeEnum.OFFICE }),
  true,
);
assert.equal(
  canCopyHierarchyNode({ id: 'ws-a', type: TreeTypeEnum.WORKSPACE }),
  false,
);
assert.equal(
  canCopyHierarchyNode({
    id: 'establishment-group:g1',
    type: TreeTypeEnum.ESTABLISHMENT_GROUP,
  }),
  false,
);

const officeDestinations = getCopyHierarchyDestinationOptions({
  source: tree['office-1//ws-a'],
  nodes: tree,
});

assert.deepEqual(
  officeDestinations.map((item) => item.treeId).sort(),
  ['sector-2//ws-a', 'sector-b//ws-b'].sort(),
);
assert.equal(
  officeDestinations.some((item) => item.treeId === 'sector-1//ws-a'),
  false,
);
assert.equal(
  officeDestinations.find((item) => item.treeId === 'sector-2//ws-a')
    ?.targetWorkspaceId,
  'ws-a',
);
assert.equal(
  officeDestinations.find((item) => item.treeId === 'sector-b//ws-b')
    ?.targetWorkspaceId,
  'ws-b',
);
assert.equal(
  officeDestinations.find((item) => item.treeId === 'sector-2//ws-a')
    ?.targetParentId,
  'sector-2',
);
assert.equal(
  officeDestinations.find((item) => item.treeId === 'sector-b//ws-b')
    ?.workspaceLabel,
  'Filial',
);
assert.equal(
  officeDestinations.find((item) => item.treeId === 'sector-2//ws-a')
    ?.workspaceLabel,
  'Matriz',
);
assert.equal(
  officeDestinations.some((item) => item.targetWorkspaceId === 'ws-c'),
  false,
);

const sectorDestinations = getCopyHierarchyDestinationOptions({
  source: tree['sector-1//ws-a'],
  nodes: tree,
});

assert.equal(
  sectorDestinations.some((item) => item.treeId === 'office-1//ws-a'),
  false,
);
assert.equal(
  sectorDestinations.some((item) => item.treeId === 'sector-b//ws-b'),
  false,
);
assert.equal(
  sectorDestinations.some((item) => item.treeId === 'ws-a'),
  false,
);
assert.equal(
  sectorDestinations.some((item) => item.treeId === 'dir-1//ws-a'),
  true,
);
assert.equal(
  sectorDestinations.find((item) => item.treeId === 'dir-1//ws-a')
    ?.targetParentId,
  'dir-1',
);
assert.equal(
  sectorDestinations.some((item) => item.treeId === 'ws-b'),
  true,
);
assert.equal(
  sectorDestinations.find((item) => item.treeId === 'ws-b')?.targetParentId,
  null,
);
assert.equal(
  sectorDestinations.find((item) => item.treeId === 'ws-b')?.targetWorkspaceId,
  'ws-b',
);
assert.equal(
  sectorDestinations.find((item) => item.treeId === 'ws-b')?.workspaceLabel,
  'Filial',
);

assert.equal(
  isHierarchyCopyDropAllowed({
    source: tree['office-1//ws-a'],
    target: tree['sector-1//ws-a'],
    nodes: tree,
  }),
  false,
);
assert.equal(
  isHierarchyCopyDropAllowed({
    source: tree['office-1//ws-a'],
    target: tree['sector-2//ws-a'],
    nodes: tree,
  }),
  true,
);
assert.equal(
  isHierarchyCopyDropAllowed({
    source: tree['office-1//ws-a'],
    target: tree['sector-b//ws-b'],
    nodes: tree,
  }),
  true,
);
assert.equal(
  isHierarchyCopyDropAllowed({
    source: tree['office-1//ws-a'],
    target: tree['ws-b'],
    nodes: tree,
  }),
  false,
);
assert.equal(
  isSameHierarchyWorkspace(tree['office-1//ws-a'], tree['sector-b//ws-b']),
  false,
);

const copyPayloadAB = buildCopyHierarchyBranchPayload({
  source: tree['office-1//ws-a'],
  target: tree['sector-b//ws-b'],
});
assert.deepEqual(copyPayloadAB, {
  sourceHierarchyId: 'office-1',
  sourceWorkspaceId: 'ws-a',
  targetParentId: 'sector-b',
  targetWorkspaceId: 'ws-b',
});

const copyPayloadAA = buildCopyHierarchyBranchPayload({
  source: tree['office-1//ws-a'],
  target: tree['sector-2//ws-a'],
});
assert.deepEqual(copyPayloadAA, {
  sourceHierarchyId: 'office-1',
  sourceWorkspaceId: 'ws-a',
  targetParentId: 'sector-2',
  targetWorkspaceId: 'ws-a',
});

const copyPayloadRootB = buildCopyHierarchyBranchPayload({
  source: tree['sector-1//ws-a'],
  target: tree['ws-b'],
});
assert.deepEqual(copyPayloadRootB, {
  sourceHierarchyId: 'sector-1',
  sourceWorkspaceId: 'ws-a',
  targetParentId: null,
  targetWorkspaceId: 'ws-b',
});

const sharedTree: ITreeMap = {
  ...tree,
  'shared//ws-a': node({
    id: 'shared//ws-a',
    label: 'X',
    parentId: 'ws-a',
    childrenIds: ['child-a//ws-a'],
    type: TreeTypeEnum.SECTOR,
  }),
  'shared//ws-b': node({
    id: 'shared//ws-b',
    label: 'X',
    parentId: 'ws-b',
    childrenIds: ['child-b//ws-b'],
    type: TreeTypeEnum.SECTOR,
  }),
  'child-a//ws-a': node({
    id: 'child-a//ws-a',
    label: 'Filho A',
    parentId: 'shared//ws-a',
    childrenIds: [],
    type: TreeTypeEnum.OFFICE,
  }),
  'child-b//ws-b': node({
    id: 'child-b//ws-b',
    label: 'Filho B',
    parentId: 'shared//ws-b',
    childrenIds: [],
    type: TreeTypeEnum.OFFICE,
  }),
};

assert.deepEqual(
  buildCopyHierarchyBranchPayload({
    source: sharedTree['shared//ws-a'],
    target: sharedTree['ws-b'],
  }),
  {
    sourceHierarchyId: 'shared',
    sourceWorkspaceId: 'ws-a',
    targetParentId: null,
    targetWorkspaceId: 'ws-b',
  },
);
assert.deepEqual(
  buildCopyHierarchyBranchPayload({
    source: sharedTree['shared//ws-b'],
    target: sharedTree['ws-a'],
  }),
  {
    sourceHierarchyId: 'shared',
    sourceWorkspaceId: 'ws-b',
    targetParentId: null,
    targetWorkspaceId: 'ws-a',
  },
);
assert.equal(
  isHierarchyCopyDropAllowed({
    source: sharedTree['shared//ws-a'],
    target: sharedTree['shared//ws-b'],
    nodes: sharedTree,
  }),
  false,
);

const onlyA: ITreeMap = {
  company: tree.company,
  'ws-a': tree['ws-a'],
  'dir-1//ws-a': tree['dir-1//ws-a'],
  'sector-1//ws-a': tree['sector-1//ws-a'],
  'sector-2//ws-a': tree['sector-2//ws-a'],
  'office-1//ws-a': tree['office-1//ws-a'],
};
assert.equal(
  getCopyHierarchyDestinationOptions({
    source: onlyA['office-1//ws-a'],
    nodes: onlyA,
  }).some((item) => item.targetWorkspaceId === 'ws-b'),
  false,
);

const treeWithUnselectedC: ITreeMap = {
  ...tree,
  company: node({
    id: 'company',
    label: 'Empresa',
    parentId: null,
    childrenIds: ['ws-a', 'ws-b'],
    type: TreeTypeEnum.COMPANY,
  }),
  'ws-c': node({
    id: 'ws-c',
    label: 'Braskem',
    parentId: 'company',
    childrenIds: ['admin-c//ws-c'],
    type: TreeTypeEnum.WORKSPACE,
  }),
  'admin-a//ws-a': node({
    id: 'admin-a//ws-a',
    label: 'ADMINISTRATIVO',
    parentId: 'ws-a',
    childrenIds: [],
    type: TreeTypeEnum.SECTOR,
  }),
  'admin-b//ws-b': node({
    id: 'admin-b//ws-b',
    label: 'ADMINISTRATIVO',
    parentId: 'ws-b',
    childrenIds: [],
    type: TreeTypeEnum.SECTOR,
  }),
  'admin-c//ws-c': node({
    id: 'admin-c//ws-c',
    label: 'ADMINISTRATIVO',
    parentId: 'ws-c',
    childrenIds: [],
    type: TreeTypeEnum.SECTOR,
  }),
};

const selectedAB = getCopyHierarchyDestinationOptions({
  source: treeWithUnselectedC['office-1//ws-a'],
  nodes: treeWithUnselectedC,
  selectedWorkspaceIds: ['ws-a', 'ws-b'],
});

assert.equal(
  selectedAB.some((item) => item.targetWorkspaceId === 'ws-a'),
  true,
);
assert.equal(
  selectedAB.some((item) => item.targetWorkspaceId === 'ws-b'),
  true,
);
assert.equal(
  selectedAB.some((item) => item.targetWorkspaceId === 'ws-c'),
  false,
);
assert.equal(
  selectedAB.some((item) => item.treeId === 'admin-c//ws-c'),
  false,
);
assert.equal(
  selectedAB.some((item) => item.treeId === 'sector-1//ws-a'),
  false,
);

const adminAB = selectedAB.filter((item) => item.label === 'ADMINISTRATIVO');
assert.equal(adminAB.length, 2);
assert.deepEqual(
  adminAB.map((item) => formatCopyHierarchyDestinationLabel(item)).sort(),
  ['Filial - ADMINISTRATIVO', 'Matriz - ADMINISTRATIVO'].sort(),
);
assert.equal(
  formatCopyHierarchyDestinationLabel(
    adminAB.find((item) => item.treeId === 'admin-a//ws-a') as (typeof adminAB)[number],
  ),
  'Matriz - ADMINISTRATIVO',
);
assert.equal(
  formatCopyHierarchyDestinationLabel(
    adminAB.find((item) => item.treeId === 'admin-b//ws-b') as (typeof adminAB)[number],
  ),
  'Filial - ADMINISTRATIVO',
);

const selectedOnlyA = getCopyHierarchyDestinationOptions({
  source: treeWithUnselectedC['office-1//ws-a'],
  nodes: treeWithUnselectedC,
  selectedWorkspaceIds: ['ws-a'],
});
assert.equal(
  selectedOnlyA.every((item) => item.targetWorkspaceId === 'ws-a'),
  true,
);
assert.equal(
  selectedOnlyA.some((item) => item.targetWorkspaceId === 'ws-b'),
  false,
);
assert.equal(
  selectedOnlyA.some((item) => item.targetWorkspaceId === 'ws-c'),
  false,
);

assert.equal(
  isHierarchyCopyDropAllowed({
    source: treeWithUnselectedC['office-1//ws-a'],
    target: treeWithUnselectedC['admin-b//ws-b'],
    nodes: treeWithUnselectedC,
  }),
  true,
);

console.log('get-copy-hierarchy-destinations.spec.ts ok');
