/**
 * Executar:
 * npx tsx src/@v2/pages/companies/sector-risk-presence/sector-risk-presence.presentation.spec.ts
 */
import assert from 'node:assert/strict';

import { SectorRiskPresence } from '@v2/services/security/sector-risk-presence/sector-risk-presence.types';

import {
  presentSectorRiskPresence,
  SECTOR_RISK_PRESENCE_MARK,
  sectorRiskPresenceAccent,
} from './sector-risk-presence.presentation';

const data: SectorRiskPresence = {
  risks: [
    { id: 'fall', label: '(ACI) Queda', typeOrder: 5 },
    { id: 'noise', label: '(FIS) Ruído', typeOrder: 1 },
  ],
  sectors: [
    { id: 'admin', name: 'Administração' },
    { id: 'heat', name: 'Caldeiraria' },
  ],
  presences: [{ riskId: 'noise', sectorId: 'heat' }],
  riskOrder: { rows: ['fall', 'noise'], columns: ['noise', 'fall'] },
  sectorOrder: ['admin', 'heat'],
};

const risksInRows = presentSectorRiskPresence(data, 'RISKS_IN_ROWS');
assert.deepEqual(
  risksInRows.rows.map((row) => row.label),
  ['(ACI) Queda', '(FIS) Ruído'],
);
assert.deepEqual(
  risksInRows.columns.map((column) => column.label),
  ['Administração', 'Caldeiraria'],
);
assert.deepEqual(risksInRows.cells, [
  [false, false],
  [false, true],
]);
assert.equal(risksInRows.rows[1]?.accent, '#7A8CA3');
assert.equal(risksInRows.columns[0]?.accent, undefined);

const sectorsInRows = presentSectorRiskPresence(data, 'SECTORS_IN_ROWS');
assert.deepEqual(
  sectorsInRows.rows.map((row) => row.label),
  ['Administração', 'Caldeiraria'],
);
assert.deepEqual(
  sectorsInRows.columns.map((column) => column.label),
  ['(FIS) Ruído', '(ACI) Queda'],
);
assert.deepEqual(sectorsInRows.cells, [
  [false, false],
  [true, false],
]);
assert.equal(sectorsInRows.cells.flat().filter(Boolean).length, 1);
assert.equal(SECTOR_RISK_PRESENCE_MARK, '●');
assert.equal(sectorRiskPresenceAccent('(ERG-PSIC) Demanda'), '#7D7388');
assert.equal(sectorRiskPresenceAccent('Caldeiraria'), undefined);

console.log('sector-risk-presence presentation spec ok');
