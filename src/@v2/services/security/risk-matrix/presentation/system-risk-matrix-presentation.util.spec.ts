/**
 * Executar:
 * npx tsx src/@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { RiskMatrixSourceEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import { getSimpleSstScaleChipColors } from 'core/utils/helpers/simple-sst-scale-chip.util';

import {
  acceptSystemRiskMatrixPresentation,
  resolveSystemAxisLevelChipColors,
  resolveSystemOccupationalChipColors,
} from './system-risk-matrix-presentation.util';

const presentation = acceptSystemRiskMatrixPresentation({
  source: RiskMatrixSourceEnum.SYSTEM,
  axisLevelColors: [
    { value: 1, color: '#111111' },
    { value: 2, color: '#222222' },
    { value: 3, color: '#333333' },
    { value: 4, color: '#444444' },
    { value: 5, color: '#555555' },
  ],
  classifications: [
    { key: 'C1', label: 'Muito baixo', color: '#AAAAAA' },
    { key: 'C2', label: 'Baixo', color: '#BBBBBB' },
    { key: 'C3', label: 'Moderado', color: '#CCCCCC' },
    { key: 'C4', label: 'Alto', color: '#DDDDDD' },
    { key: 'C5', label: 'Muito Alto', color: '#EEEEEE' },
  ],
  extraordinaryProbability: {
    value: 6,
    label: 'Interromper atividades',
    color: '#000000',
    editable: false,
  },
});

assert.ok(presentation);
assert.equal(presentation.source, RiskMatrixSourceEnum.SYSTEM);

assert.equal(resolveSystemAxisLevelChipColors(3, presentation).bgcolor, '#333333');
assert.equal(
  resolveSystemOccupationalChipColors(3, presentation).bgcolor,
  '#CCCCCC',
);
assert.notEqual(
  resolveSystemAxisLevelChipColors(3, presentation).bgcolor,
  resolveSystemOccupationalChipColors(3, presentation).bgcolor,
);

const afterS3 = acceptSystemRiskMatrixPresentation({
  ...presentation,
  axisLevelColors: presentation.axisLevelColors.map((item) =>
    item.value === 3 ? { ...item, color: '#00FF00' } : item,
  ),
});
assert.equal(resolveSystemAxisLevelChipColors(3, afterS3).bgcolor, '#00FF00');
assert.equal(
  resolveSystemOccupationalChipColors(3, afterS3).bgcolor,
  '#CCCCCC',
);

const afterC3 = acceptSystemRiskMatrixPresentation({
  ...presentation,
  classifications: presentation.classifications.map((item) =>
    item.key === 'C3' ? { ...item, color: '#0000FF' } : item,
  ),
});
assert.equal(
  resolveSystemOccupationalChipColors(3, afterC3).bgcolor,
  '#0000FF',
);
assert.equal(resolveSystemAxisLevelChipColors(3, afterC3).bgcolor, '#333333');

const p6 = resolveSystemAxisLevelChipColors(6, presentation);
const ro6 = resolveSystemOccupationalChipColors(6, presentation);
assert.equal(p6.bgcolor, '#000000');
assert.equal(ro6.bgcolor, '#000000');
assert.equal(
  presentation.axisLevelColors.some((item) => item.value === 6),
  false,
);
assert.equal(
  presentation.classifications.some((item) => item.key === 'C6'),
  false,
);

assert.deepEqual(
  resolveSystemAxisLevelChipColors(3, null),
  getSimpleSstScaleChipColors(3),
);
assert.deepEqual(
  resolveSystemOccupationalChipColors(3, null),
  getSimpleSstScaleChipColors(3),
);
assert.equal(
  resolveSystemOccupationalChipColors(3, null, 'action-plan-tag').bgcolor,
  'primary.main',
);

const characterizationRo = resolveSystemOccupationalChipColors(3, presentation);
const actionPlanRo = resolveSystemOccupationalChipColors(
  3,
  presentation,
  'action-plan-tag',
);
assert.equal(characterizationRo.bgcolor, actionPlanRo.bgcolor);
assert.equal(characterizationRo.bgcolor, '#CCCCCC');

assert.equal(
  acceptSystemRiskMatrixPresentation({
    source: RiskMatrixSourceEnum.CUSTOM,
    axisLevelColors: presentation.axisLevelColors,
    classifications: presentation.classifications,
  }),
  null,
);
assert.equal(
  acceptSystemRiskMatrixPresentation({
    axisLevelColors: presentation.axisLevelColors,
    classifications: presentation.classifications,
  }),
  null,
);
assert.deepEqual(
  resolveSystemOccupationalChipColors(
    3,
    acceptSystemRiskMatrixPresentation({
      source: RiskMatrixSourceEnum.CUSTOM,
      axisLevelColors: [{ value: 3, color: '#FFFFFF' }],
      classifications: [{ key: 'C3', label: 'X', color: '#FFFFFF' }],
    }),
  ),
  getSimpleSstScaleChipColors(3),
);

const pageSource = readFileSync(
  'src/@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util.ts',
  'utf8',
);
assert.equal(pageSource.includes('matrixVersionId'), false);
assert.equal(pageSource.includes('getMatrizRisk'), false);
assert.ok(pageSource.includes('C${level}'));
assert.ok(pageSource.includes('source !== RiskMatrixSourceEnum.SYSTEM'));

const tagSource = readFileSync(
  'src/@v2/components/organisms/STable/implementation/SActionPlanTable/components/OccupationalRiskTag/OccupationalRiskTag.tsx',
  'utf8',
);
assert.ok(tagSource.includes("resolveSystemOccupationalChipColors"));
assert.ok(tagSource.includes("'action-plan-tag'"));
assert.equal(tagSource.includes('matrixSource'), false);

const sTagSource = readFileSync('src/components/atoms/STag/index.tsx', 'utf8');
assert.ok(sTagSource.includes('getSimpleSstScaleChipColors'));
assert.ok(sTagSource.includes('chipColors'));

const serviceSource = readFileSync(
  'src/@v2/services/security/risk-matrix/service/risk-matrix.service.ts',
  'utf8',
);
assert.ok(serviceSource.includes('RiskMatrixRoutes.SYSTEM_PRESENTATION'));

console.log('system-risk-matrix-presentation.util.spec.ts OK');
