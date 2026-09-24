/**
 * Executar:
 * npx tsx src/@v2/services/security/risk-matrix/presentation/axis-level-tooltip.util.spec.ts
 */
import assert from 'node:assert/strict';

import { RiskMatrixSourceEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import { resolveDisplayedAxisLevelChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import { resolveAxisLevelTooltip } from '@v2/services/security/risk-matrix/presentation/axis-level-tooltip.util';

const customLevels = [
  {
    axis: 'PROBABILITY',
    value: 3,
    label: 'Pouco Provável',
    criteriaByCoverage: [
      { coverageKey: 'ERG', criterion: 'criterio erg P3' },
      { coverageKey: 'ACI', criterion: 'criterio aci P3' },
    ],
  },
  {
    axis: 'SEVERITY',
    value: 3,
    label: 'Moderada CUSTOM',
    criteriaByCoverage: [
      { coverageKey: 'ERG', criterion: 'criterio erg S3' },
      { coverageKey: 'ACI', criterion: 'criterio aci S3' },
    ],
  },
  {
    axis: 'PROBABILITY',
    value: 4,
    label: 'Provável',
    criteriaByCoverage: [],
  },
  {
    axis: 'SEVERITY',
    value: 1,
    label: '',
    criteriaByCoverage: [],
  },
];

const systemLevels = [
  {
    axis: 'PROBABILITY',
    value: 3,
    label: 'Moderada (Possível)',
    criteriaByCoverage: [
      { coverageKey: 'ERG', criterion: 'criterio system erg' },
      { coverageKey: 'ACI', criterion: 'criterio system aci' },
    ],
  },
  {
    axis: 'SEVERITY',
    value: 3,
    label: 'Moderado',
    criteriaByCoverage: [{ coverageKey: 'ERG', criterion: 'criterio system S3' }],
  },
];

const base = {
  pinnedAxisLevels: customLevels,
  systemAxisLevels: systemLevels,
  extraordinaryLabel: 'Interromper atividades',
};

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'P',
    value: 3,
    matrixSource: RiskMatrixSourceEnum.CUSTOM,
    evaluatedCoverageKey: 'ERG',
  }),
  { heading: 'P3 — Pouco Provável', criterion: 'criterio erg P3' },
);

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'S',
    value: 3,
    matrixSource: RiskMatrixSourceEnum.CUSTOM,
    evaluatedCoverageKey: 'ERG',
  }),
  { heading: 'S3 — Moderada CUSTOM', criterion: 'criterio erg S3' },
);

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'P',
    value: 3,
    matrixSource: RiskMatrixSourceEnum.CUSTOM,
    riskType: 'ACI',
  }),
  { heading: 'P3 — Pouco Provável', criterion: 'criterio aci P3' },
);

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'S',
    value: 3,
    matrixSource: RiskMatrixSourceEnum.CUSTOM,
    evaluatedCoverageKey: 'ACI',
    riskType: 'ERG',
  }),
  { heading: 'S3 — Moderada CUSTOM', criterion: 'criterio aci S3' },
);

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'P',
    value: 3,
    matrixSource: RiskMatrixSourceEnum.SYSTEM,
    evaluatedCoverageKey: 'ERG',
  }),
  { heading: 'P3 — Moderada (Possível)', criterion: 'criterio system erg' },
);

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'S',
    value: 3,
    matrixSource: RiskMatrixSourceEnum.CUSTOM,
    evaluatedCoverageKey: 'ERG',
  }),
  { heading: 'S3 — Moderada CUSTOM', criterion: 'criterio erg S3' },
);
assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'S',
    value: 3,
    matrixSource: RiskMatrixSourceEnum.SYSTEM,
    evaluatedCoverageKey: 'ERG',
  }),
  { heading: 'S3 — Moderado', criterion: 'criterio system S3' },
);

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'P',
    value: 4,
    matrixSource: RiskMatrixSourceEnum.CUSTOM,
    evaluatedCoverageKey: 'ERG',
  }),
  { heading: 'P4 — Provável', criterion: null },
);

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'S',
    value: 1,
    matrixSource: RiskMatrixSourceEnum.CUSTOM,
    evaluatedCoverageKey: 'ERG',
  }),
  null,
);

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'P',
    value: 6,
    matrixSource: RiskMatrixSourceEnum.SYSTEM,
    evaluatedCoverageKey: 'ERG',
  }),
  { heading: 'P6 — Interromper atividades', criterion: null },
);

assert.deepEqual(
  resolveAxisLevelTooltip({
    ...base,
    kind: 'P',
    value: 6,
    matrixSource: RiskMatrixSourceEnum.CUSTOM,
    evaluatedCoverageKey: 'ERG',
  }),
  null,
);

const colors = resolveDisplayedAxisLevelChipColors({
  value: 3,
  matrixSource: RiskMatrixSourceEnum.CUSTOM,
  axisLevelColors: [{ value: 3, color: '#F6D040' }],
  systemPresentation: {
    source: RiskMatrixSourceEnum.SYSTEM,
    axisLevelColors: [{ value: 3, color: '#64C6A2' }],
    classifications: [],
  },
});
assert.deepEqual(colors.bgcolor, '#F6D040');

console.log('axis-level-tooltip.util.spec: ok');
