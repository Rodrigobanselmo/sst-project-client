/**
 * Executar:
 * npx tsx src/@v2/services/security/risk-matrix/presentation/custom-pinned-axis-color.spec.ts
 */
import assert from 'node:assert/strict';

import { RiskMatrixSourceEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import {
  acceptSystemRiskMatrixPresentation,
  resolveDisplayedAxisLevelChipColors,
  resolveSystemAxisLevelChipColors,
} from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import {
  resolveDisplayedOccupationalRisk,
  resolvePinnedCustomClassificationColor,
} from 'core/utils/helpers/matriz';

const system = acceptSystemRiskMatrixPresentation({
  source: RiskMatrixSourceEnum.SYSTEM,
  axisLevelColors: [
    { value: 1, color: '#3FAE7A' },
    { value: 2, color: '#64C6A2' },
    { value: 3, color: '#F6D040' },
    { value: 4, color: '#F27329' },
    { value: 5, color: '#E50000' },
  ],
  classifications: [
    { key: 'C1', color: '#3FAE7A' },
    { key: 'C2', color: '#64C6A2' },
    { key: 'C3', color: '#F6D040' },
    { key: 'C4', color: '#F27329' },
    { key: 'C5', color: '#E50000' },
  ],
});

const customAxis = [
  { value: 1, color: '#2196F3' },
  { value: 3, color: '#F6D040' },
];

assert.equal(
  resolveDisplayedAxisLevelChipColors({
    value: 1,
    matrixSource: 'CUSTOM',
    axisLevelColors: customAxis,
    systemPresentation: system,
  }).bgcolor,
  '#2196F3',
);
assert.equal(
  resolveDisplayedAxisLevelChipColors({
    value: 3,
    matrixSource: 'CUSTOM',
    axisLevelColors: customAxis,
    systemPresentation: system,
  }).bgcolor,
  '#F6D040',
);
assert.equal(
  resolveDisplayedAxisLevelChipColors({
    value: 1,
    matrixSource: 'SYSTEM',
    axisLevelColors: customAxis,
    systemPresentation: system,
  }).bgcolor,
  '#3FAE7A',
);
assert.equal(
  resolveSystemAxisLevelChipColors(1, system).bgcolor,
  resolveDisplayedAxisLevelChipColors({
    value: 1,
    matrixSource: 'SYSTEM',
    axisLevelColors: null,
    systemPresentation: system,
  }).bgcolor,
);

const snapshot = { resolvedColor: '#00AA00' };
const displayed = resolveDisplayedOccupationalRisk({
  isQuantity: false,
  level: 2,
  severity: 3,
  probability: 1,
  matrixSource: 'CUSTOM',
  matrixVersionId: 'version-1',
  resolvedLabel: 'Tolerável',
  resolvedColor: snapshot.resolvedColor,
  classificationPresentationColor: '#2196f3',
  resolvedLegacyBand: 2,
});
assert.equal(displayed?.color, '#2196F3');
assert.equal(displayed?.label, 'Tolerável');
assert.equal(displayed?.level, 2);
assert.equal(snapshot.resolvedColor, '#00AA00');
assert.equal(
  resolvePinnedCustomClassificationColor({
    matrixSource: 'CUSTOM',
    matrixVersionId: 'version-1',
    liveColor: null,
    snapshotColor: '#00AA00',
  }),
  '#00AA00',
);

console.log('custom-pinned-axis-color.spec.ts OK');
