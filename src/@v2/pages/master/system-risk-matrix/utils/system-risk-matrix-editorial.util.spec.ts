/**
 * Executar:
 * npx tsx src/@v2/pages/master/system-risk-matrix/utils/system-risk-matrix-editorial.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { parseCriterionHierarchy } from '@v2/pages/companies/risk-matrices/utils/risk-matrix-criteria-display.util';
import {
  CompanyRiskMatrixVersionStatusEnum,
  RiskMatrixAxisEnum,
  RiskMatrixCoverageKeyEnum,
  RiskMatrixGridOrientationEnum,
  RiskMatrixSourceEnum,
  RiskMatrixYAxisDirectionEnum,
  type SystemRiskMatrixProjection,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  buildSystemRiskMatrixEditorialState,
  buildSystemRiskMatrixPutPayload,
  isSystemRiskMatrixEditorialDirty,
  overlayEditorialOnEditorState,
  payloadHasForbiddenStructuralFields,
  setSystemAxisCriterion,
  setSystemAxisLevelColor,
  setSystemClassificationColor,
  toAxisLevelColorByValue,
} from './system-risk-matrix-editorial.util';
import { hydrateSystemRiskMatrixView } from './system-risk-matrix-view.util';

const COVERAGES = [
  RiskMatrixCoverageKeyEnum.FIS,
  RiskMatrixCoverageKeyEnum.QUI,
  RiskMatrixCoverageKeyEnum.BIO,
  RiskMatrixCoverageKeyEnum.ACI,
  RiskMatrixCoverageKeyEnum.ERG,
  RiskMatrixCoverageKeyEnum.PSICOSOCIAL,
] as const;

const completeAxisCriteria = () => {
  const items: SystemRiskMatrixProjection['axisCriteria'] = [];
  for (const axis of [RiskMatrixAxisEnum.SEVERITY, RiskMatrixAxisEnum.PROBABILITY]) {
    for (const value of [1, 2, 3, 4, 5]) {
      for (const coverageKey of COVERAGES) {
        items.push({
          axis,
          value,
          coverageKey,
          criterion: `${axis} ${value} ${coverageKey}`,
        });
      }
    }
  }
  return items;
};

const projection: SystemRiskMatrixProjection = {
  source: RiskMatrixSourceEnum.SYSTEM,
  name: 'Padrão SimpleSST',
  description: 'Metodologia nativa 5×5 do SimpleSST.',
  readOnly: true,
  coverages: [...COVERAGES],
  methodologicalGaps: [],
  extraordinaryProbability: {
    value: 6,
    label: 'Interromper atividades',
    color: '#000000',
    editable: false,
  },
  axisCriteria: completeAxisCriteria(),
  axisLevelColors: [
    { value: 1, color: '#3CBE7D' },
    { value: 2, color: '#8FA728' },
    { value: 3, color: '#D9D10B' },
    { value: 4, color: '#D96C2F' },
    { value: 5, color: '#F44336' },
  ],
  classificationColors: [
    { key: 'C1', color: '#3CBE7D' },
    { key: 'C2', color: '#8FA728' },
    { key: 'C3', color: '#D9D10B' },
    { key: 'C4', color: '#D96C2F' },
    { key: 'C5', color: '#F44336' },
  ],
  version: {
    id: 'system-risk-matrix-version',
    matrixId: 'system-risk-matrix',
    companyId: null,
    versionNumber: 1,
    status: CompanyRiskMatrixVersionStatusEnum.PUBLISHED,
    nameSnapshot: 'Padrão SimpleSST',
    publishedAt: null,
    gridOrientation: RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
    yAxisDirection: RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
    coverages: [...COVERAGES],
    axisLevelColors: [
      { value: 1, color: '#3CBE7D' },
      { value: 2, color: '#8FA728' },
      { value: 3, color: '#D9D10B' },
      { value: 4, color: '#D96C2F' },
      { value: 5, color: '#F44336' },
    ],
    axisLevels: [
      {
        id: 's1',
        axis: RiskMatrixAxisEnum.SEVERITY,
        value: 1,
        label: 'Desprezível',
        criteriaByCoverage: COVERAGES.map((coverageKey) => ({
          coverageKey,
          criterion: `SEVERITY 1 ${coverageKey}`,
        })),
      },
      {
        id: 'p1',
        axis: RiskMatrixAxisEnum.PROBABILITY,
        value: 1,
        label: 'Desprezível (Improvável)',
        criteriaByCoverage: COVERAGES.map((coverageKey) => ({
          coverageKey,
          criterion: `PROBABILITY 1 ${coverageKey}`,
        })),
      },
    ],
    classifications: [
      {
        id: 'system-classification-1',
        key: 'C1',
        label: 'Muito baixo',
        abbreviation: 'MB',
        color: '#3CBE7D',
        sortOrder: 1,
        compatibilityBands: [1],
      },
      {
        id: 'system-classification-3',
        key: 'C3',
        label: 'Moderado',
        abbreviation: 'M',
        color: '#D9D10B',
        sortOrder: 3,
        compatibilityBands: [3],
      },
    ],
    cells: [
      {
        id: 'system-cell-s1-p1',
        severity: 1,
        probability: 1,
        classificationId: 'system-classification-1',
      },
    ],
  },
};

const editorial = buildSystemRiskMatrixEditorialState(projection);
const payload = buildSystemRiskMatrixPutPayload(editorial);

assert.equal(editorial.axisCriteria.length, 60);
assert.equal(editorial.axisLevelColors.length, 5);
assert.equal(editorial.classificationColors.length, 5);
assert.equal(payload.axisCriteria.length, 60);
assert.equal(payload.axisLevelColors.length, 5);
assert.equal(payload.classificationColors.length, 5);

const values = payload.axisLevelColors.map((item) => item.value);
assert.deepEqual(values, [1, 2, 3, 4, 5]);
assert.equal(new Set(values).size, 5);
assert.equal(
  payload.axisLevelColors.every((item) => !('axis' in item)),
  true,
);

const editedAxis = setSystemAxisLevelColor(editorial, 3, '#111111');
const afterS3 = buildSystemRiskMatrixPutPayload(editedAxis);
assert.equal(afterS3.axisLevelColors.find((item) => item.value === 3)?.color, '#111111');
assert.equal(
  afterS3.classificationColors.find((item) => item.key === 'C3')?.color,
  '#D9D10B',
);

const editedClass = setSystemClassificationColor(editorial, 'C3', '#AAAAAA');
const afterC3 = buildSystemRiskMatrixPutPayload(editedClass);
assert.equal(afterC3.classificationColors.find((item) => item.key === 'C3')?.color, '#AAAAAA');
assert.equal(
  afterC3.axisLevelColors.find((item) => item.value === 3)?.color,
  '#D9D10B',
);

const rawCriterion = 'Qualitativo\ntexto cru não parseado {{{';
const editedCriterion = setSystemAxisCriterion(editorial, {
  axis: RiskMatrixAxisEnum.SEVERITY,
  value: 1,
  coverageKey: RiskMatrixCoverageKeyEnum.FIS,
  criterion: rawCriterion,
});
const criterionPayload = buildSystemRiskMatrixPutPayload(editedCriterion);
const sent = criterionPayload.axisCriteria.find(
  (item) =>
    item.axis === RiskMatrixAxisEnum.SEVERITY &&
    item.value === 1 &&
    item.coverageKey === RiskMatrixCoverageKeyEnum.FIS,
);
assert.equal(sent?.criterion, rawCriterion);
assert.equal(sent?.axis, RiskMatrixAxisEnum.SEVERITY);
assert.equal(sent?.value, 1);
assert.equal(sent?.coverageKey, RiskMatrixCoverageKeyEnum.FIS);
const preview = parseCriterionHierarchy(rawCriterion);
assert.ok(Array.isArray(preview));
assert.equal(sent?.criterion, rawCriterion);

assert.equal(payloadHasForbiddenStructuralFields(payload), false);
assert.equal(JSON.stringify(payload).includes('"cells"'), false);
assert.equal(JSON.stringify(payload).includes('gridOrientation'), false);
assert.equal(JSON.stringify(payload).includes('Interromper'), false);
assert.equal(
  payload.axisCriteria.some((item) => item.value === 6),
  false,
);
assert.equal(
  payload.axisLevelColors.some((item) => item.value === 6),
  false,
);

const duplicateColors = buildSystemRiskMatrixEditorialState({
  ...projection,
  axisLevelColors: [
    { value: 1, color: '#111111' },
    { value: 1, color: '#222222' },
    { value: 2, color: '#8FA728' },
    { value: 3, color: '#D9D10B' },
    { value: 4, color: '#D96C2F' },
    { value: 5, color: '#F44336' },
  ],
});
assert.equal(duplicateColors.axisLevelColors.length, 5);
assert.equal(duplicateColors.axisLevelColors[0].color, '#111111');

const byValue = toAxisLevelColorByValue(editorial.axisLevelColors);
assert.equal(byValue[1], editorial.axisLevelColors[0].color);
assert.equal(byValue[5], editorial.axisLevelColors[4].color);

const view = hydrateSystemRiskMatrixView(projection);
const overlaid = overlayEditorialOnEditorState(
  view.editor,
  setSystemClassificationColor(editorial, 'C1', '#ABCDEF'),
);
assert.equal(
  overlaid.classifications.find((item) => item.key === 'C1')?.color,
  '#ABCDEF',
);
assert.equal(overlaid.cells[0].classificationKey, 'C1');

const savedProjection: SystemRiskMatrixProjection = {
  ...projection,
  axisLevelColors: [
    { value: 1, color: '#010101' },
    { value: 2, color: '#020202' },
    { value: 3, color: '#030303' },
    { value: 4, color: '#040404' },
    { value: 5, color: '#050505' },
  ],
};
const rehydrated = buildSystemRiskMatrixEditorialState(savedProjection);
assert.equal(rehydrated.axisLevelColors[0].color, '#010101');
assert.equal(isSystemRiskMatrixEditorialDirty(rehydrated, rehydrated), false);
assert.equal(isSystemRiskMatrixEditorialDirty(editedAxis, editorial), true);

const pageSource = readFileSync(
  'src/@v2/pages/master/system-risk-matrix/SystemRiskMatrixPage.tsx',
  'utf8',
);
assert.ok(pageSource.includes('Edição editorial'));
assert.ok(/Salvar\n\s*<\/Button>/.test(pageSource));
assert.equal(pageSource.includes('Salvar rascunho'), false);
assert.equal(pageSource.includes('Somente leitura'), false);
assert.ok(pageSource.includes('Cores de Severidade e Probabilidade'));
assert.ok(pageSource.includes('S{item.value} = P{item.value}'));
assert.ok(pageSource.includes('TextField'));
assert.ok(pageSource.includes('CriterionHierarchyView'));
assert.ok(pageSource.includes('axisLevelColorByValue'));
assert.ok(pageSource.includes('disabled'));
assert.ok(pageSource.includes('onPaintCell={() => undefined}'));
assert.ok(pageSource.includes('buildSystemRiskMatrixPutPayload'));
assert.ok(pageSource.includes('buildSystemRiskMatrixEditorialState(saved)'));
assert.equal(pageSource.includes('system-presentation'), false);
assert.equal(pageSource.includes('useMutateReplaceRiskMatrixDraft'), false);
assert.equal(pageSource.includes('severityColor'), false);
assert.equal(pageSource.includes('probabilityColor'), false);

const gridSource = readFileSync(
  'src/@v2/pages/companies/risk-matrices/components/RiskMatrixGridEditor.tsx',
  'utf8',
);
assert.ok(gridSource.includes('axisLevelColorByValue?:'));
assert.ok(gridSource.includes("badgeColor || 'grey.200'"));
const customEditorSource = readFileSync(
  'src/@v2/pages/companies/risk-matrices/components/RiskMatrixEditorPageContent.tsx',
  'utf8',
);
assert.ok(customEditorSource.includes('axisLevelColorByValue'));
assert.ok(customEditorSource.includes('Cores de Severidade e Probabilidade'));
assert.ok(customEditorSource.includes('Usar paleta padrão SimpleSST'));

const hierarchySource = readFileSync(
  'src/@v2/pages/companies/risk-matrices/components/CriterionHierarchyView.tsx',
  'utf8',
);
assert.ok(hierarchySource.includes('try {'));
assert.ok(hierarchySource.includes('parseCriterionHierarchy'));

const serviceSource = readFileSync(
  'src/@v2/services/security/risk-matrix/service/risk-matrix.service.ts',
  'utf8',
);
assert.ok(serviceSource.includes('api.put<SystemRiskMatrixProjection>'));
assert.ok(serviceSource.includes('RiskMatrixRoutes.SYSTEM'));

console.log('system-risk-matrix-editorial.util.spec.ts OK');
