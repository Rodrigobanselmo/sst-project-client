/**
 * Executar: npx tsx src/components/organisms/main/Tree/OrgTree/utils/filter-tree-map-by-workspace.spec.ts
 */
import assert from 'node:assert/strict';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap } from '../interfaces';
import { filterTreeMapByWorkspace } from './filter-tree-map-by-workspace';

function node(
  partial: Pick<
    ITreeMap[string],
    'id' | 'label' | 'parentId' | 'childrenIds' | 'type'
  >,
): ITreeMap[string] {
  return { ...partial, expand: true, ghos: [] };
}

function tree(): ITreeMap {
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

const full = tree();
assert.deepEqual(
  filterTreeMapByWorkspace(full, []).seed.childrenIds,
  ['ws-a', 'ws-b', 'ws-c'],
);

const one = filterTreeMapByWorkspace(full, ['ws-b']);
assert.deepEqual(one.seed.childrenIds, ['ws-b']);
assert.equal(one['cargo-a//ws-a']?.label, 'Cargo A');
assert.equal(one['cargo-b//ws-b']?.label, 'Cargo B');

const two = filterTreeMapByWorkspace(full, ['ws-c', 'ws-a']);
assert.deepEqual(two.seed.childrenIds, ['ws-a', 'ws-c']);

const missing = filterTreeMapByWorkspace(full, ['ws-missing']);
assert.equal(missing, full);

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

const nestedOne = filterTreeMapByWorkspace(nested, ['ws-b']);
assert.deepEqual(nestedOne.seed.childrenIds, ['container']);
assert.equal(nestedOne['ws-b']?.label, 'B');

const nestedMissing = filterTreeMapByWorkspace(nested, ['ws-missing']);
assert.equal(nestedMissing, nested);

console.log('filter-tree-map-by-workspace.spec.ts OK');
