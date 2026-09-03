/**
 * npx tsx src/components/organisms/tables/HierarchyHomoTable/format-hierarchy-cargo-path.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  formatCharacterizationSectorGroupedRow,
  formatHierarchyFullContextLabel,
  formatHierarchySectorCargoLabel,
} from './format-hierarchy-cargo-path.util';

const labeled = formatHierarchySectorCargoLabel({
  name: 'Soldador',
  type: 'OFFICE',
  parents: [
    { type: 'SECTOR', name: 'Manutenção' },
    { type: 'SUB_SECTOR', name: 'Mecânica' },
  ],
});

assert.equal(labeled.displayName, 'Manutenção > Mecânica > Soldador');
assert.equal(
  formatHierarchyFullContextLabel({
    workspaceName: 'Canoas',
    sectorName: labeled.sectorName,
    cargoName: labeled.cargoName,
  }),
  'Canoas > Manutenção > Mecânica > Soldador',
);

assert.equal(
  formatHierarchySectorCargoLabel({ name: 'Ajudante' }).displayName,
  'Ajudante',
);

const homonym = formatCharacterizationSectorGroupedRow({
  name: 'MECÂNICO DE MANUTENÇÃO',
  type: 'OFFICE',
  parents: [
    { type: 'SECTOR', id: 'sec-1', name: 'MANUTENÇÃO MECÂNICA' },
    { type: 'SUB_SECTOR', id: 'sub-1', name: 'MANUTENÇÃO MECÂNICA' },
  ],
});
assert.equal(homonym.sectorGroupName, 'MANUTENÇÃO MECÂNICA');
assert.equal(homonym.displayName, 'MECÂNICO DE MANUTENÇÃO');

const distinct = formatCharacterizationSectorGroupedRow({
  name: 'MECÂNICO',
  type: 'OFFICE',
  parents: [
    { type: 'SECTOR', id: 'sec-2', name: 'MANUTENÇÃO' },
    { type: 'SUB_SECTOR', id: 'sub-2', name: 'MECÂNICA' },
  ],
});
assert.equal(distinct.sectorGroupName, 'MANUTENÇÃO');
assert.equal(distinct.displayName, 'MECÂNICA > MECÂNICO');

assert.equal(
  formatCharacterizationSectorGroupedRow({
    name: 'SOLDADOR',
    type: 'OFFICE',
    parents: [{ type: 'SECTOR', name: 'SOLDAGEM' }],
  }).displayName,
  'SOLDADOR',
);

console.log('format-hierarchy-cargo-path.util.spec.ts ok');
