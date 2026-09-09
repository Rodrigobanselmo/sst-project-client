import assert from 'node:assert/strict';

import {
  buildInventoryParentPath,
  buildInventoryParentPathSegments,
  formatInventoryParentPathLabel,
  indexParentsById,
} from './inventory-parent-path';

const directory = {
  id: 'dir-geral',
  name: 'DIRETORIA GERAL',
  type: 'DIRECTORY',
  parentId: null,
};
const management = {
  id: 'dir-tec',
  name: 'DIRETORIA TÉCNICA',
  type: 'MANAGEMENT',
  parentId: 'dir-geral',
};
const sector = {
  id: 'sec-st',
  name: 'SEGURANÇA DO TRABALHO',
  type: 'SECTOR',
  parentId: 'dir-tec',
};
const byId = indexParentsById([directory, management, sector]);

const segments = buildInventoryParentPathSegments(sector, byId);
assert.deepEqual(
  segments.map((item) => item.type),
  ['DIRECTORY', 'MANAGEMENT', 'SECTOR'],
);
assert.equal(
  formatInventoryParentPathLabel(segments),
  '[D] DIRETORIA GERAL > [G] DIRETORIA TÉCNICA > [S] SEGURANÇA DO TRABALHO',
);
assert.equal(
  buildInventoryParentPath(management, byId),
  '[D] DIRETORIA GERAL > [G] DIRETORIA TÉCNICA',
);

const skipped = buildInventoryParentPathSegments(
  {
    id: 'sec-direct',
    name: 'SEGURANÇA DO TRABALHO',
    type: 'SECTOR',
    parentId: 'dir-geral',
  },
  byId,
);
assert.deepEqual(
  skipped.map((item) => `${item.type}:${item.name}`),
  ['DIRECTORY:DIRETORIA GERAL', 'SECTOR:SEGURANÇA DO TRABALHO'],
);

console.log('inventory-parent-path type marks: ok');
