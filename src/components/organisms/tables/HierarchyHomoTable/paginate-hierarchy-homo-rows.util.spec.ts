/**
 * npx tsx src/components/organisms/tables/HierarchyHomoTable/paginate-hierarchy-homo-rows.util.spec.ts
 */
import assert from 'node:assert/strict';

import { insertWorkspaceGroupHeaders } from './group-hierarchy-homo-rows.util';
import { paginateHierarchyHomoRows } from './paginate-hierarchy-homo-rows.util';

const rows = Array.from({ length: 178 }, (_, index) => ({
  id: `row-${index + 1}`,
  workspaceGroupId: index < 90 ? 'ws-a' : 'ws-b',
  workspaceGroupName: index < 90 ? 'A' : 'B',
  sectorName: 'Setor',
  cargoName: `Cargo ${index + 1}`,
}));

assert.equal(paginateHierarchyHomoRows(rows, 1, 15).length, 15);
assert.equal(paginateHierarchyHomoRows(rows, 1, 25).length, 25);
assert.equal(paginateHierarchyHomoRows(rows, 1, 50).length, 50);

const page1 = paginateHierarchyHomoRows(rows, 1, 100);
const page2 = paginateHierarchyHomoRows(rows, 2, 100);
assert.equal(page1.length, 100);
assert.equal(page2.length, 78);
assert.equal(page1[0]?.id, 'row-1');
assert.equal(page2[0]?.id, 'row-101');

const page1WithHeaders = insertWorkspaceGroupHeaders(page1);
assert.equal(
  page1WithHeaders.filter((row) => row.kind === 'cargo').length,
  100,
);
assert.equal(
  insertWorkspaceGroupHeaders(page2).filter((row) => row.kind === 'cargo')
    .length,
  78,
);

console.log('paginate-hierarchy-homo-rows.util.spec.ts ok');
