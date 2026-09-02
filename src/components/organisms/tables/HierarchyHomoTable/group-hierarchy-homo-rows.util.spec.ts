/**
 * npx tsx src/components/organisms/tables/HierarchyHomoTable/group-hierarchy-homo-rows.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  insertWorkspaceGroupHeaders,
  sortHierarchyHomoRowsByWorkspaceGroup,
} from './group-hierarchy-homo-rows.util';

const rows = [
  {
    id: '2',
    workspaceGroupId: 'ws-b',
    workspaceGroupName: 'Beta',
    sectorName: 'Setor Z',
    cargoName: 'Cargo B',
  },
  {
    id: '1',
    workspaceGroupId: 'ws-a',
    workspaceGroupName: 'Alfa',
    sectorName: 'Setor A',
    cargoName: 'Cargo A',
  },
  {
    id: '3',
    workspaceGroupId: 'ws-a',
    workspaceGroupName: 'Alfa',
    sectorName: 'Setor A',
    cargoName: 'Cargo C',
  },
];

const sorted = sortHierarchyHomoRowsByWorkspaceGroup(rows, 'ws-b');
assert.deepEqual(
  sorted.map((row) => row.id),
  ['2', '1', '3'],
);

const withHeaders = insertWorkspaceGroupHeaders(sorted);
assert.equal(withHeaders[0]?.kind, 'group');
assert.equal(
  withHeaders[0]?.kind === 'group' && withHeaders[0].workspaceGroupName,
  'Beta',
);
assert.equal(withHeaders.filter((row) => row.kind === 'cargo').length, 3);
assert.equal(withHeaders.filter((row) => row.kind === 'group').length, 2);

console.log('group-hierarchy-homo-rows.util.spec.ts ok');
