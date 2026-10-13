/**
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddGHO/resolve-gse-create-workspaces.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildGseCreateWorkspacePayload,
  resolveGseCreateWorkspaceIds,
} from './resolve-gse-create-workspaces.util';

assert.deepEqual(
  resolveGseCreateWorkspaceIds({
    tabWorkspaceId: 'matriz',
    companyWorkspaceIds: ['matriz', 'moeve'],
  }),
  ['matriz'],
);

assert.equal(buildGseCreateWorkspacePayload([]), null);
assert.deepEqual(buildGseCreateWorkspacePayload(['matriz', 'matriz', 'moeve']), [
  'matriz',
  'moeve',
]);

const editSource = readFileSync(
  resolve(__dirname, 'hooks/useAddGho.ts'),
  'utf8',
);
assert.equal(
  editSource.includes('buildGseCreateWorkspacePayload(selectedWorkspaceIds)'),
  true,
);
assert.equal(
  editSource.includes('Selecione ao menos um estabelecimento'),
  true,
);
assert.equal(editSource.includes('status === 400'), true);

console.log('resolve-gse-create-workspaces.util.spec.ts: ok');
