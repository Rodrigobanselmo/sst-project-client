import assert from 'node:assert/strict';

import { firstNodeId } from 'core/constants/first-node-id.constant';
import { TreeTypeEnum as Type } from '../enums/tree-type.enums';
import { ITreeMap, ITreeMapObject } from '../interfaces';
import { projectVisibleHierarchy } from './project-visible-hierarchy';

function node(
  id: string,
  type: Type,
  parentId: string | null,
  childrenIds: string[] = [],
): ITreeMapObject {
  return { id, type, parentId, childrenIds, label: id, expand: false, ghos: [] };
}

const nodes: ITreeMap = {
  [firstNodeId]: node(firstNodeId, Type.COMPANY, null, ['group']),
  group: node('group', Type.ESTABLISHMENT_GROUP, firstNodeId, ['workspace']),
  workspace: node('workspace', Type.WORKSPACE, 'group', ['directory', 'excluded']),
  directory: node('directory', Type.DIRECTORY, 'workspace', ['sector']),
  excluded: { ...node('excluded', Type.SECTOR, 'workspace'), hide: true },
  sector: node('sector', Type.SECTOR, 'directory', ['office']),
  office: node('office', Type.OFFICE, 'sector', ['subOffice']),
  subOffice: node('subOffice', Type.SUB_OFFICE, 'office'),
};
const snapshot = JSON.stringify(nodes);
const hidden = new Set([
  Type.COMPANY, Type.ESTABLISHMENT_GROUP, Type.WORKSPACE, Type.DIRECTORY,
]);

const compact = projectVisibleHierarchy(nodes, hidden, true);
assert.deepEqual(compact.roots, ['sector']);
assert.deepEqual(compact.children.get('sector'), ['office']);
assert.deepEqual([...compact.renderedIds], ['sector']);
assert.equal(JSON.stringify(nodes), snapshot);

const offices = projectVisibleHierarchy(
  nodes,
  new Set([...hidden, Type.SECTOR, Type.OFFICE, Type.SUB_OFFICE]),
  false,
);
assert.deepEqual(offices.roots, ['office']);
assert.deepEqual(offices.children.get('office'), ['subOffice']);
assert.deepEqual([...offices.renderedIds], ['office', 'subOffice']);
console.log('project-visible-hierarchy.spec.ts OK');
