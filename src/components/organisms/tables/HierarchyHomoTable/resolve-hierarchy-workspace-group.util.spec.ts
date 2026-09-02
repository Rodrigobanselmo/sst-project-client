/**
 * npx tsx src/components/organisms/tables/HierarchyHomoTable/resolve-hierarchy-workspace-group.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  compareWorkspaceGroupOrder,
  resolveHierarchyWorkspaceGroupId,
  UNGROUPED_WORKSPACE_ID,
} from './resolve-hierarchy-workspace-group.util';

assert.equal(
  resolveHierarchyWorkspaceGroupId({
    hierarchyWorkspaceIds: ['ws-a', 'ws-b'],
    gseWorkspaceIds: ['ws-b', 'ws-c'],
    preferredWorkspaceId: 'ws-a',
  }),
  'ws-b',
  'intersection wins over preferred outside the GSE',
);

assert.equal(
  resolveHierarchyWorkspaceGroupId({
    hierarchyWorkspaceIds: ['ws-a', 'ws-b'],
    gseWorkspaceIds: ['ws-a', 'ws-b'],
    preferredWorkspaceId: 'ws-b',
  }),
  'ws-b',
  'preferred wins when it is in the intersection',
);

assert.equal(
  resolveHierarchyWorkspaceGroupId({
    hierarchyWorkspaceIds: ['ws-a', 'ws-b'],
    gseWorkspaceIds: ['ws-a', 'ws-b'],
  }),
  'ws-a',
  'first GSE intersection candidate when no preferred',
);

assert.equal(
  resolveHierarchyWorkspaceGroupId({
    hierarchyWorkspaceIds: ['ws-a'],
    gseWorkspaceIds: ['ws-x'],
  }),
  UNGROUPED_WORKSPACE_ID,
  'no intersection → ungrouped',
);

assert.equal(
  compareWorkspaceGroupOrder({
    aGroupId: 'ws-b',
    bGroupId: 'ws-a',
    aName: 'B',
    bName: 'A',
    preferredWorkspaceId: 'ws-b',
  }),
  -1,
);

assert.equal(
  compareWorkspaceGroupOrder({
    aGroupId: UNGROUPED_WORKSPACE_ID,
    bGroupId: 'ws-a',
    aName: 'Sem',
    bName: 'A',
  }),
  1,
);

console.log('resolve-hierarchy-workspace-group.util.spec.ts ok');
