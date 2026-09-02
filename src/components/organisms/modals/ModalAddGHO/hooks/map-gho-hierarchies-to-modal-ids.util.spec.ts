/**
 * npx tsx src/components/organisms/modals/ModalAddGHO/hooks/map-gho-hierarchies-to-modal-ids.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  buildGseCargoModalTitle,
  mapGhoHierarchiesToModalSelectIds,
} from './map-gho-hierarchies-to-modal-ids.util';

const ids = mapGhoHierarchiesToModalSelectIds([
  {
    id: 'cargo-1',
    workspaces: [{ id: 'ws-1' }, { id: 'ws-2' }],
    hierarchyOnHomogeneous: [{ endDate: null }],
  } as any,
  {
    id: 'cargo-ended',
    workspaceIds: ['ws-1'],
    hierarchyOnHomogeneous: [{ endDate: new Date() }],
  } as any,
  {
    id: 'cargo-2//ignored',
    workspaceIds: ['ws-3'],
    hierarchyOnHomogeneous: [{ endDate: null }],
  } as any,
]);

assert.deepEqual(ids, ['cargo-1//ws-1', 'cargo-1//ws-2', 'cargo-2//ws-3']);
assert.deepEqual(
  mapGhoHierarchiesToModalSelectIds(
    [
      {
        id: 'cargo-1',
        workspaces: [{ id: 'ws-1' }, { id: 'ws-2' }],
        hierarchyOnHomogeneous: [{ endDate: null }],
      } as any,
    ],
    ['ws-1'],
  ),
  ['cargo-1//ws-1'],
);
assert.equal(
  buildGseCargoModalTitle('GSE 03 — Manutenção Mecânica'),
  'Editar cargos — GSE 03 — Manutenção Mecânica',
);
assert.equal(buildGseCargoModalTitle(''), 'Editar cargos');

console.log('map-gho-hierarchies-to-modal-ids.util.spec.ts ok');
