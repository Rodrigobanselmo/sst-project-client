/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-prioritization/risk-prioritization.util.spec.ts
 */
import assert from 'node:assert/strict';

import { CHARACTERIZATION_WIZARD_STEP } from '@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/characterization-wizard-steps';
import { GSE_WIZARD_STEP } from 'components/organisms/modals/ModalAddGHO/gse-wizard-steps';
import { ModalEnum } from 'core/enums/modal.enums';
import { CharacterizationSubTabEnum } from 'core/constants/characterization-navigation.constants';

import {
  displayedPrioritizationOrientation,
  legendForPrioritizationState,
  presentPrioritizationMatrix,
  prioritizationOrientationToPersist,
  visiblePrioritizationClassification,
} from './risk-prioritization.presentation';
import {
  buildPrioritizationCellTooltip,
  cellKey,
  indexPrioritizationCells,
  normalizeCssColor,
  PRIORITIZATION_CHARACTERIZATION_WIZARD_STEP,
  resolvePrioritizationCellClick,
  resolvePrioritizationOriginNavigation,
  resolvePrioritizationViewState,
  sortPrioritizationOrigins,
} from './risk-prioritization.util';
import type {
  RiskPrioritizationCell,
  RiskPrioritizationOrigin,
} from '@v2/services/security/risk-prioritization/risk-prioritization.types';

const origin = (
  overrides: Partial<RiskPrioritizationOrigin> &
    Pick<RiskPrioritizationOrigin, 'riskFactorDataId' | 'originKind'>,
): RiskPrioritizationOrigin => ({
  riskFactorId: 'risk-1',
  homogeneousGroupId: overrides.homogeneousGroupId || 'g1',
  originId: overrides.originId || 'g1',
  originName: 'Origem',
  originTypeLabel: 'GSE',
  resolutionSource: 'GSE_OWN_RISKS',
  isDeterminant: false,
  openOrigin: null,
  ...overrides,
});

const cell = (
  overrides: Partial<RiskPrioritizationCell> = {},
): RiskPrioritizationCell => ({
  rowId: 'gse-1',
  riskId: 'risk-1',
  abbreviation: 'M',
  label: 'Moderado',
  color: '#cccccc',
  level: 3,
  isQuantity: false,
  isPrioritized: false,
  probability: 3,
  severity: 4,
  matrixSource: 'SYSTEM',
  matrixVersionId: null,
  origins: [],
  ...overrides,
});

assert.equal(
  CharacterizationSubTabEnum.PRIORITIZATION,
  6,
  'subaba Priorização uses a new active index and keeps 0-5 stable',
);
assert.equal(PRIORITIZATION_CHARACTERIZATION_WIZARD_STEP, 4);

assert.equal(resolvePrioritizationViewState({
  isLoading: false,
  isError: false,
  hasData: false,
}), 'need-workspace');
assert.equal(resolvePrioritizationViewState({
  workspaceId: 'ws',
  isLoading: true,
  isError: false,
  hasData: false,
}), 'loading');
assert.equal(resolvePrioritizationViewState({
  workspaceId: 'ws',
  isLoading: false,
  isError: true,
  hasData: false,
}), 'error');
assert.equal(resolvePrioritizationViewState({
  workspaceId: 'ws',
  isLoading: false,
  isError: false,
  hasData: false,
}), 'empty');
assert.equal(resolvePrioritizationViewState({
  workspaceId: 'ws',
  isLoading: false,
  isError: false,
  hasData: true,
}), 'grid');

const customCell = cell({
  abbreviation: 'MERG',
  label: 'Moderado_ERG',
  color: '#112233',
  matrixSource: 'CUSTOM',
  matrixVersionId: 'ver-1',
  origins: [
    origin({
      riskFactorDataId: 'r1',
      originKind: 'GSE',
      openOrigin: { kind: 'GSE', id: 'gse-1' },
    }),
  ],
});
assert.equal(customCell.abbreviation.length, 4);
assert.equal(customCell.abbreviation, 'MERG');

const quantityCell = cell({
  isQuantity: true,
  level: 3,
  abbreviation: 'M',
  probability: null,
  severity: null,
  origins: [
    origin({
      riskFactorDataId: 'q1',
      originKind: 'CHARACTERIZATION',
      openOrigin: { kind: 'CHARACTERIZATION', id: 'c1', workspaceId: 'ws-1' },
    }),
  ],
});
assert.equal(quantityCell.isQuantity, true);

const prioritized = cell({ isPrioritized: true, level: 4, abbreviation: 'A' });
assert.equal(prioritized.isPrioritized, true);
assert.ok(prioritized.level >= 4);

const legendCollision = [
  { abbreviation: 'M', label: 'Moderado', matrixSource: 'SYSTEM' as const },
  { abbreviation: 'M', label: 'Moderado_ERG', matrixSource: 'CUSTOM' as const },
];
assert.equal(legendCollision[0]!.abbreviation, legendCollision[1]!.abbreviation);
assert.notEqual(legendCollision[0]!.label, legendCollision[1]!.label);
assert.notEqual(legendCollision[0]!.matrixSource, legendCollision[1]!.matrixSource);

const indexed = indexPrioritizationCells([customCell]);
assert.equal(indexed.get(cellKey('gse-1', 'risk-1')), customCell);
assert.equal(indexed.has(cellKey('gse-2', 'risk-1')), false);
assert.equal(resolvePrioritizationCellClick(undefined).type, 'none');
assert.equal(resolvePrioritizationCellClick(cell({ origins: [] })).type, 'none');

const singleGse = resolvePrioritizationCellClick(customCell);
assert.equal(singleGse.type, 'open-origin');
if (singleGse.type === 'open-origin') {
  const nav = resolvePrioritizationOriginNavigation({
    origin: singleGse.origin,
    companyId: 'c1',
  });
  assert.equal(nav?.type, 'gse');
  if (nav?.type === 'gse') {
    assert.equal(nav.modal, ModalEnum.GHO_ADD);
    assert.equal(nav.payload.initialWizardStep, GSE_WIZARD_STEP.RISKS);
    assert.equal(nav.payload.id, 'gse-1');
  }
}

const charOrigin = origin({
  riskFactorDataId: 'c-origin',
  originKind: 'CHARACTERIZATION',
  originName: 'Ambiente X',
  originTypeLabel: 'Elemento Caracterizado',
  openOrigin: { kind: 'CHARACTERIZATION', id: 'char-1', workspaceId: 'ws-1' },
});
const charClick = resolvePrioritizationCellClick(
  cell({ origins: [charOrigin] }),
);
assert.equal(charClick.type, 'open-origin');
if (charClick.type === 'open-origin') {
  const nav = resolvePrioritizationOriginNavigation({
    origin: charClick.origin,
    companyId: 'c1',
  });
  assert.equal(nav?.type, 'characterization');
  if (nav?.type === 'characterization') {
    assert.ok(nav.href.includes('/caracterizacao-editar/char-1'));
    assert.ok(
      nav.href.includes(`wizardStep=${CHARACTERIZATION_WIZARD_STEP.RISKS}`),
    );
  }
}

const hierarchyOnly = origin({
  riskFactorDataId: 'h1',
  originKind: 'HIERARCHY',
  originName: 'Cargo',
  originTypeLabel: 'Cargo',
  openOrigin: null,
});
assert.equal(
  resolvePrioritizationCellClick(cell({ origins: [hierarchyOnly] })).type,
  'none',
);
assert.equal(
  resolvePrioritizationOriginNavigation({
    origin: hierarchyOnly,
    companyId: 'c1',
  }),
  null,
);

const many = resolvePrioritizationCellClick(
  cell({
    origins: [
      origin({
        riskFactorDataId: 'o2',
        originKind: 'HIERARCHY',
        originName: 'Cargo',
        isDeterminant: false,
        openOrigin: null,
      }),
      origin({
        riskFactorDataId: 'o1',
        originKind: 'GSE',
        originName: 'GSE A',
        isDeterminant: true,
        openOrigin: { kind: 'GSE', id: 'gse-1' },
      }),
    ],
  }),
);
assert.equal(many.type, 'select-origins');
if (many.type === 'select-origins') {
  assert.equal(many.origins.length, 2);
  assert.equal(many.origins[0]!.isDeterminant, true);
  assert.equal(many.origins[1]!.originKind, 'HIERARCHY');
  assert.equal(many.origins[1]!.openOrigin, null);
}

const sorted = sortPrioritizationOrigins([
  origin({
    riskFactorDataId: 'b',
    originKind: 'GSE',
    originName: 'Beta',
    isDeterminant: false,
  }),
  origin({
    riskFactorDataId: 'a',
    originKind: 'CHARACTERIZATION',
    originName: 'Alfa',
    isDeterminant: true,
  }),
]);
assert.equal(sorted[0]!.isDeterminant, true);
assert.equal(sorted[0]!.originName, 'Alfa');

const tooltip = buildPrioritizationCellTooltip({
  riskName: 'Ruído',
  cell: quantityCell,
});
assert.ok(tooltip.includes('Ruído'));
assert.ok(tooltip.includes('Quantitativo'));
assert.ok(tooltip.includes('Nível 3'));
assert.ok(tooltip.includes('1 origem'));
assert.ok(tooltip.includes('M — Moderado'));
assert.ok(!tooltip.includes(' × '));
assert.ok(!tooltip.toLowerCase().includes('employee'));
assert.ok(!tooltip.toLowerCase().includes('cpf'));

const qualitativeTooltip = buildPrioritizationCellTooltip({
  riskName: 'Manganês elementar',
  cell: cell({
    abbreviation: 'A',
    label: 'Alto',
    level: 4,
    isQuantity: false,
    probability: 3,
    severity: 5,
    origins: [origin({ riskFactorDataId: 'q1', originKind: 'GSE' })],
  }),
});
assert.ok(qualitativeTooltip.includes('P3 × S5 = A (Alto)'));
assert.ok(qualitativeTooltip.includes('Nível 4 · Qualitativo'));
assert.ok(qualitativeTooltip.includes('1 origem'));
assert.ok(!qualitativeTooltip.includes('A — Alto'));

const qualitativeFallbackTooltip = buildPrioritizationCellTooltip({
  riskName: 'Ruído',
  cell: cell({
    abbreviation: 'A',
    label: 'Alto',
    level: 4,
    isQuantity: false,
    probability: null,
    severity: null,
  }),
});
assert.ok(qualitativeFallbackTooltip.includes('A — Alto'));
assert.ok(!qualitativeFallbackTooltip.includes(' × '));

assert.equal(normalizeCssColor('d96c2f'), '#d96c2f');
assert.equal(normalizeCssColor('#F44336'), '#F44336');
assert.equal(normalizeCssColor(null), undefined);

const matrix = {
  rows: [
    { id: 'unit-a', label: 'GSE Alfa', kind: 'REAL_GSE' as const },
    { id: 'unit-b', label: 'Atividade B', kind: 'UNITARY_FALLBACK' as const },
  ],
  columns: [
    { riskId: 'risk-noise', name: 'Ruído', typeCode: 'FIS' },
    { riskId: 'risk-chem', name: 'Acetona', typeCode: 'QUI' },
  ],
  cells: [
    cell({
      rowId: 'unit-a',
      riskId: 'risk-noise',
      abbreviation: 'MERG',
      label: 'Moderado_ERG',
      matrixSource: 'CUSTOM',
      isQuantity: true,
      matrixVersionId: 'ver-1',
      origins: [
        origin({
          riskFactorDataId: 'r-click',
          originKind: 'GSE',
          openOrigin: { kind: 'GSE', id: 'unit-a' },
        }),
      ],
    }),
    cell({
      rowId: 'unit-b',
      riskId: 'risk-chem',
      abbreviation: 'A',
      label: 'Alto',
      matrixSource: 'SYSTEM',
      isQuantity: false,
    }),
  ],
};

assert.equal(displayedPrioritizationOrientation(null), 'UNITS_IN_ROWS');
assert.equal(displayedPrioritizationOrientation(undefined), 'UNITS_IN_ROWS');
assert.equal(prioritizationOrientationToPersist({ event: 'open', stored: null }), null);
assert.equal(
  prioritizationOrientationToPersist({
    event: 'select',
    stored: 'UNITS_IN_ROWS',
    selected: 'UNITS_IN_ROWS',
  }),
  null,
);
assert.equal(
  prioritizationOrientationToPersist({
    event: 'select',
    stored: null,
    selected: 'UNITS_IN_ROWS',
  }),
  'UNITS_IN_ROWS',
);

const unitsView = presentPrioritizationMatrix(matrix, 'UNITS_IN_ROWS');
const risksView = presentPrioritizationMatrix(matrix, 'RISKS_IN_ROWS');
assert.equal(unitsView.cornerLabel, 'GSE / Elemento');
assert.equal(risksView.cornerLabel, 'Riscos');
assert.deepEqual(
  unitsView.rows.map((row) => row.id),
  ['unit-a', 'unit-b'],
);
assert.deepEqual(
  risksView.rows.map((row) => row.id),
  ['risk-noise', 'risk-chem'],
);
assert.deepEqual(
  risksView.columns.map((column) => column.id),
  ['unit-a', 'unit-b'],
);

const unitsCell = unitsView.cell('unit-a', 'risk-noise');
const risksCell = risksView.cell('risk-noise', 'unit-a');
assert.equal(unitsCell, risksCell);
assert.equal(unitsCell?.abbreviation, 'MERG');
assert.equal(unitsCell?.matrixSource, 'CUSTOM');
assert.equal(unitsCell?.isQuantity, true);
assert.equal(unitsCell?.matrixVersionId, 'ver-1');
assert.deepEqual(
  resolvePrioritizationCellClick(unitsCell),
  resolvePrioritizationCellClick(risksCell),
);
assert.equal(resolvePrioritizationCellClick(unitsCell).type, 'open-origin');

const legendSource = matrix.cells.map((entry) => ({
  abbreviation: entry.abbreviation,
  label: entry.label,
  matrixSource: entry.matrixSource,
  isQuantity: entry.isQuantity,
}));
assert.deepEqual(
  legendSource,
  [unitsCell, risksView.cell('risk-chem', 'unit-b')].map((entry) => ({
    abbreviation: entry?.abbreviation,
    label: entry?.label,
    matrixSource: entry?.matrixSource,
    isQuantity: entry?.isQuantity,
  })),
);

const residualCell = cell({
  rowId: 'unit-a',
  riskId: 'risk-noise',
  abbreviation: 'A',
  label: 'Alto',
  color: '#d96c2f',
  level: 4,
  isPrioritized: true,
  origins: [
    origin({
      riskFactorDataId: 'r-click',
      originKind: 'GSE',
      openOrigin: { kind: 'GSE', id: 'unit-a' },
    }),
  ],
  residual: {
    abbreviation: 'B',
    label: 'Baixo',
    color: '#4caf50',
    level: 2,
    matrixSource: 'SYSTEM',
    matrixVersionId: null,
  },
});
const emptyResidual = cell({
  abbreviation: 'MA',
  label: 'Muito Alto',
  residual: null,
});

assert.equal(visiblePrioritizationClassification(residualCell, 'REAL')?.abbreviation, 'A');
assert.equal(visiblePrioritizationClassification(residualCell, 'RESIDUAL')?.abbreviation, 'B');
assert.equal(visiblePrioritizationClassification(residualCell, 'RESIDUAL')?.isQuantity, false);
assert.equal(visiblePrioritizationClassification(emptyResidual, 'RESIDUAL'), null);
assert.equal(emptyResidual.abbreviation, 'MA');
assert.equal(residualCell.rowId, 'unit-a');
assert.equal(residualCell.riskId, 'risk-noise');
assert.equal(resolvePrioritizationCellClick(residualCell).type, 'open-origin');

const residualMatrix = {
  ...matrix,
  cells: [residualCell],
  legend: [{ abbreviation: 'A', label: 'Alto', color: '#d96c2f', matrixSource: 'SYSTEM' as const }],
  residualLegend: [
    { abbreviation: 'B', label: 'Baixo', color: '#4caf50', matrixSource: 'SYSTEM' as const },
  ],
};
assert.deepEqual(legendForPrioritizationState(residualMatrix, 'REAL'), residualMatrix.legend);
assert.deepEqual(
  legendForPrioritizationState(residualMatrix, 'RESIDUAL'),
  residualMatrix.residualLegend,
);
const residualUnits = presentPrioritizationMatrix(residualMatrix, 'UNITS_IN_ROWS');
const residualRisks = presentPrioritizationMatrix(residualMatrix, 'RISKS_IN_ROWS');
assert.equal(residualUnits.cell('unit-a', 'risk-noise'), residualRisks.cell('risk-noise', 'unit-a'));
assert.equal(
  visiblePrioritizationClassification(
    residualUnits.cell('unit-a', 'risk-noise')!,
    'RESIDUAL',
  )?.abbreviation,
  'B',
);
assert.equal(
  prioritizationOrientationToPersist({ event: 'open', stored: 'UNITS_IN_ROWS' }),
  null,
);
const residualTooltip = buildPrioritizationCellTooltip({
  riskName: 'Ruído',
  cell: residualCell,
  riskState: 'RESIDUAL',
});
assert.ok(residualTooltip.includes('B — Baixo'));
assert.ok(!residualTooltip.includes('P3'));
const emptyTooltip = buildPrioritizationCellTooltip({
  riskName: 'Ruído',
  cell: emptyResidual,
  riskState: 'RESIDUAL',
});
assert.ok(emptyTooltip.includes('Sem classificação residual'));
assert.ok(!emptyTooltip.includes('MA'));

console.log('risk-prioritization.util.spec.ts OK');
