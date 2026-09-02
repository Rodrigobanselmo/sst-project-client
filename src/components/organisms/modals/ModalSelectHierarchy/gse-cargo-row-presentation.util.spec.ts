/**
 * npx tsx src/components/organisms/modals/ModalSelectHierarchy/gse-cargo-row-presentation.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  getGseCargoBadgeSx,
  getGseCargoRowPresentation,
} from './gse-cargo-row-presentation.util';

const withSubsector = getGseCargoRowPresentation({
  workspaceName: 'Corteva – (GO) Aparecida de Goiânia',
  cargoName: 'ANALISTA FINANCEIRO SENIOR',
  parents: [
    { type: 'SECTOR', name: 'Administrativo' },
    { type: 'SUB_SECTOR', name: 'Financeiro' },
  ],
});

assert.equal(withSubsector.cargoName, 'ANALISTA FINANCEIRO SENIOR');
assert.equal(
  withSubsector.workspaceTooltip,
  'Estabelecimento: Corteva – (GO) Aparecida de Goiânia',
);
assert.equal(
  withSubsector.sectorTooltip,
  'Setor: Administrativo\nSubsetor: Financeiro',
);

const sectorOnly = getGseCargoRowPresentation({
  workspaceName: 'Canoas',
  cargoName: 'Soldador',
  parents: [{ type: 'SECTOR', name: 'Manutenção' }],
});
assert.equal(sectorOnly.sectorTooltip, 'Setor: Manutenção');
assert.equal(sectorOnly.subSectorName, '');

const empty = getGseCargoRowPresentation({});
assert.equal(empty.cargoName, '-');
assert.equal(empty.workspaceTooltip, 'Estabelecimento: -');
assert.equal(empty.sectorTooltip, 'Setor: -');

assert.deepEqual(getGseCargoBadgeSx('light'), { backgroundColor: 'gray.200' });
assert.deepEqual(getGseCargoBadgeSx('dark'), {
  backgroundColor: 'gray.700',
  color: 'text.main',
  border: '1px solid',
  borderColor: 'background.border',
});

console.log('gse-cargo-row-presentation.util.spec.ts ok');
