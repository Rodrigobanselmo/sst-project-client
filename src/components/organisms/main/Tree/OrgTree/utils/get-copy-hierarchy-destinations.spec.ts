/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/utils/get-copy-hierarchy-destinations.spec.ts
 */
import assert from 'node:assert/strict';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap } from '../interfaces';
import {
  canCopyHierarchyNode,
  getCopyHierarchyDestinationOptions,
  isHierarchyCopyDropAllowed,
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

const officeDestinations = getCopyHierarchyDestinationOptions({
  source: tree['office-1//ws-a'],
  nodes: tree,
});

assert.deepEqual(
  officeDestinations.map((item) => item.treeId).sort(),
  ['sector-2//ws-a'].sort(),
);
assert.equal(
  officeDestinations.some((item) => item.treeId === 'sector-1//ws-a'),
  false,
);
assert.equal(
  officeDestinations.every((item) => item.targetWorkspaceId === 'ws-a'),
  true,
);
assert.equal(
  officeDestinations.find((item) => item.treeId === 'sector-2//ws-a')
    ?.targetParentId,
  'sector-2',
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
  false,
);

console.log('get-copy-hierarchy-destinations.spec.ts ok');
