/**
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddGHO/get-gse-linked-workspace-ids.util.spec.ts
 */
import assert from 'node:assert/strict';

import { getGseLinkedWorkspaceIds } from './get-gse-linked-workspace-ids.util';

const emptyGho = {
  workspaceIds: [] as string[],
  workspaces: [] as Array<{ id: string }>,
};

assert.deepEqual(
  getGseLinkedWorkspaceIds({
    ...emptyGho,
    workspaceIds: ['ws-1'],
  } as any),
  ['ws-1'],
);

assert.deepEqual(
  getGseLinkedWorkspaceIds({
    ...emptyGho,
    workspaceIds: ['ws-1', 'ws-2'],
  } as any),
  ['ws-1', 'ws-2'],
);

assert.deepEqual(
  getGseLinkedWorkspaceIds(emptyGho as any, { workspaceIds: ['ws-9'] } as any),
  ['ws-9'],
);

console.log('get-gse-linked-workspace-ids.util.spec.ts ok');
