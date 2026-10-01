/**
 * Executar:
 * npx tsx src/@v2/pages/companies/sector-risk-presence/sector-risk-presence.presentation.spec.ts
 */
import assert from 'node:assert/strict';

import { SectorRiskPresence } from '@v2/services/security/sector-risk-presence/sector-risk-presence.types';

import { buildSectorRiskPresenceNavigation } from './sector-risk-presence-navigation';
import {
  findSectorRiskPresence,
  originsForSectorRiskPresence,
  presentSectorRiskPresence,
  sectorRiskPresenceCellRef,
  sectorRiskPresenceTooltip,
  SECTOR_RISK_PRESENCE_DEFAULT_ORIENTATION,
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
  presences: [{ riskId: 'noise', sectorId: 'heat', originIds: ['gho-heat', 'gho-ancestral'] }],
  origins: [
    {
      id: 'gho-admin',
      label: 'GSE Administrativo\n(GSE)',
      name: 'GSE Administrativo',
      typeLabel: 'GSE',
      kind: 'GSE',
      ghoType: null,
      ghoName: 'GSE Administrativo',
    },
    {
      id: 'gho-ancestral',
      label: 'Operações\n(Superintendência)',
      name: 'Operações',
      typeLabel: 'Superintendência',
      kind: 'HIERARCHY',
      ghoType: 'HIERARCHY',
      ghoName: 'Operações',
      hierarchyName: 'Operações',
    },
    {
      id: 'gho-heat',
      label: 'Solda de tubulação\n(Atividade)',
      name: 'Solda de tubulação',
      typeLabel: 'Atividade',
      kind: 'CHARACTERIZATION',
      ghoType: 'ACTIVITIES',
      ghoName: 'Solda de tubulação',
    },
  ],
  riskOrder: { rows: ['fall', 'noise'], columns: ['noise', 'fall'] },
  sectorOrder: ['admin', 'heat'],
};

assert.equal(SECTOR_RISK_PRESENCE_DEFAULT_ORIENTATION, 'SECTORS_IN_ROWS');

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

const heatFromRisks = sectorRiskPresenceCellRef('RISKS_IN_ROWS', 'noise', 'heat');
const heatFromSectors = sectorRiskPresenceCellRef('SECTORS_IN_ROWS', 'heat', 'noise');
assert.deepEqual(heatFromRisks, { riskId: 'noise', sectorId: 'heat' });
assert.deepEqual(heatFromSectors, heatFromRisks);
assert.equal(findSectorRiskPresence(data, 'fall', 'admin'), undefined);
assert.deepEqual(originsForSectorRiskPresence(data, 'fall', 'admin'), []);
assert.deepEqual(
  originsForSectorRiskPresence(data, 'noise', 'heat').map((origin) => origin.id),
  ['gho-heat', 'gho-ancestral'],
);
assert.equal(
  sectorRiskPresenceTooltip({
    riskLabel: '(FIS) Ruído',
    sectorName: 'Caldeiraria',
    originCount: 2,
  }),
  '(FIS) Ruído\nCaldeiraria\n2 origens',
);
assert.equal(
  sectorRiskPresenceTooltip({
    riskLabel: '(FIS) Ruído',
    sectorName: 'Caldeiraria',
    originCount: 1,
  }).endsWith('1 origem'),
  true,
);

const split: SectorRiskPresence = {
  ...data,
  presences: [
    { riskId: 'noise', sectorId: 'heat', originIds: ['gho-heat'] },
    { riskId: 'noise', sectorId: 'admin', originIds: ['gho-admin'] },
  ],
};
assert.deepEqual(
  originsForSectorRiskPresence(split, 'noise', 'heat').map((origin) => origin.id),
  ['gho-heat'],
);
assert.deepEqual(
  originsForSectorRiskPresence(split, 'noise', 'admin').map((origin) => origin.id),
  ['gho-admin'],
);
const heatWhenSectorsAreRows = sectorRiskPresenceCellRef('SECTORS_IN_ROWS', 'heat', 'noise');
assert.deepEqual(
  originsForSectorRiskPresence(split, heatWhenSectorsAreRows.riskId, heatWhenSectorsAreRows.sectorId).map(
    (origin) => origin.id,
  ),
  ['gho-heat'],
);

const gse = data.origins.find((origin) => origin.kind === 'GSE')!;
const gseTarget = buildSectorRiskPresenceNavigation({
  origin: gse,
  riskId: 'noise',
  riskLabel: '(FIS) Ruído',
});
assert.equal(gseTarget.homogeneousGroup.type, null);
assert.notEqual(gseTarget.homogeneousGroup.type, 0);
assert.equal(gseTarget.homogeneousGroup.name, 'GSE Administrativo');
assert.equal(gseTarget.riskFactor.id, 'noise');
assert.equal(gseTarget.riskFactor.name, 'Ruído');

const hierarchy = data.origins.find((origin) => origin.kind === 'HIERARCHY')!;
const hierarchyTarget = buildSectorRiskPresenceNavigation({
  origin: hierarchy,
  riskId: 'noise',
  riskLabel: '(FIS) Ruído',
});
assert.equal(hierarchyTarget.homogeneousGroup.type, 'HIERARCHY');
assert.deepEqual(hierarchyTarget.homogeneousGroup.hierarchy, { name: 'Operações' });

const characterization = data.origins.find((origin) => origin.kind === 'CHARACTERIZATION')!;
const characterizationTarget = buildSectorRiskPresenceNavigation({
  origin: characterization,
  riskId: 'noise',
  riskLabel: '(FIS) Ruído',
});
assert.equal(characterizationTarget.homogeneousGroup.type, 'ACTIVITIES');
assert.equal(characterizationTarget.homogeneousGroup.description, 'Solda de tubulação');

const environmentTarget = buildSectorRiskPresenceNavigation({
  origin: {
    ...characterization,
    id: 'gho-env',
    ghoType: 'ENVIRONMENT',
    ghoName: 'Galpão',
    name: 'Galpão',
  },
  riskId: 'noise',
  riskLabel: '(FIS) Ruído',
});
assert.equal(environmentTarget.homogeneousGroup.type, 'ENVIRONMENT');
assert.equal(environmentTarget.homogeneousGroup.description, 'Galpão');

console.log('sector-risk-presence presentation spec ok');
