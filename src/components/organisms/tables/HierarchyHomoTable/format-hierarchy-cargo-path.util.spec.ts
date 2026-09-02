/**
 * npx tsx src/components/organisms/tables/HierarchyHomoTable/format-hierarchy-cargo-path.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
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

console.log('format-hierarchy-cargo-path.util.spec.ts ok');
