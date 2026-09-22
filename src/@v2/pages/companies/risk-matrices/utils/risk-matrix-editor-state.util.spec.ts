/**
 * Executar:
 * npx tsx src/@v2/pages/companies/risk-matrices/utils/risk-matrix-editor-state.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  CompanyRiskMatrixVersionStatusEnum,
  RiskMatrixAxisEnum,
  RiskMatrixCoverageKeyEnum,
  RiskMatrixGridOrientationEnum,
  RiskMatrixYAxisDirectionEnum,
  type RiskMatrixVersion,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import {
  RISK_MATRIX_PUBLISH_CONFIRMATION,
  RISK_MATRIX_PUBLISH_SAVE_FIRST_MESSAGE,
  RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS,
  RISK_MATRIX_SIMPLE_SST_HELP,
  RISK_MATRIX_VERSION_STATUS_LABELS,
} from '../maps/risk-matrix.maps';

import {
  cartesianCoordinatesFromAxisLevels,
  canAttemptPublishRiskMatrixVersion,
  coordinateFromGridPresentation,
  copyAxisLevelCriterionToOtherCoverages,
  createEmptyV1EditorAxisLevels,
  getAxisLevelCriterion,
  getAxisLevelsByAxis,
  getGridPresentation,
  getPresentedGridAxes,
  hasFilledCriteriaForCoverage,
  hydrateEditorState,
  isCompatibilityBandUsedByOther,
  isEditorStateDirty,
  moveClassification,
  nextClassificationKey,
  paintEditorCell,
  removeClassification,
  setClassificationCompatibilityBands,
  setClassificationCount,
  shouldShowRiskMatrixPublishActions,
  toggleCoverage,
  tryRemoveClassification,
  trySetClassificationCount,
  updateAxisLevelCriterion,
  validateEditorState,
  toReplaceDraftPayload,
} from './risk-matrix-editor-state.util';

const emptySeed = createEmptyV1EditorAxisLevels();
assert.equal(emptySeed.length, 10);
assert.deepEqual(
  getAxisLevelsByAxis(emptySeed, RiskMatrixAxisEnum.SEVERITY).map((item) => item.value),
  [1, 2, 3, 4, 5],
);
assert.deepEqual(
  getAxisLevelsByAxis(emptySeed, RiskMatrixAxisEnum.PROBABILITY).map((item) => item.value),
  [1, 2, 3, 4, 5],
);
assert.ok(
  emptySeed.every(
    (level) => level.label === '' && Object.keys(level.criteriaByCoverage).length === 0,
  ),
);

const emptyVersion = {
  axisLevels: [],
  classifications: [],
  cells: [],
  coverages: [],
} as Pick<RiskMatrixVersion, 'axisLevels' | 'classifications' | 'cells' | 'coverages'>;

const emptyHydrated = hydrateEditorState(emptyVersion);
assert.equal(emptyHydrated.axisLevels.length, 10);
assert.ok(emptyHydrated.axisLevels.every((level) => !level.label));
assert.equal(emptyHydrated.classifications.length, 4);
assert.deepEqual(
  emptyHydrated.classifications.map((item) => item.key),
  ['C1', 'C2', 'C3', 'C4'],
);
assert.ok(
  emptyHydrated.classifications.every(
    (item) => item.compatibilityBands.length === 0,
  ),
);
assert.ok(
  emptyHydrated.classifications.every((item) => item.abbreviation === ''),
);
assert.deepEqual(emptyHydrated.cells, []);
assert.deepEqual(emptyHydrated.coverages, []);
assert.equal(
  emptyHydrated.gridOrientation,
  RiskMatrixGridOrientationEnum.PROBABILITY_ON_X,
);
assert.equal(
  emptyHydrated.yAxisDirection,
  RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
);
assert.equal(emptyHydrated.name, '');
assert.equal(emptyHydrated.description, '');

const hydratedCopy = hydrateEditorState(
  {
    ...emptyVersion,
    nameSnapshot: 'Matriz de Riscos Físicos, Químicos e Biológicos — ACELEN — Cópia',
  },
  {
    name: 'Matriz de Riscos Físicos, Químicos e Biológicos — ACELEN — Cópia',
    description: 'Metodologia clonada',
  },
);
assert.equal(
  hydratedCopy.name,
  'Matriz de Riscos Físicos, Químicos e Biológicos — ACELEN — Cópia',
);
assert.equal(hydratedCopy.description, 'Metodologia clonada');

const persisted = hydrateEditorState({
  coverages: [RiskMatrixCoverageKeyEnum.FIS],
  gridOrientation: RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
  yAxisDirection: RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM,
  axisLevels: [
    {
      id: 's2',
      axis: RiskMatrixAxisEnum.SEVERITY,
      value: 2,
      label: 'Moderada',
      criteriaByCoverage: [
        { coverageKey: RiskMatrixCoverageKeyEnum.FIS, criterion: 'critério 2' },
      ],
    },
    {
      id: 's1',
      axis: RiskMatrixAxisEnum.SEVERITY,
      value: 1,
      label: 'Muito Baixa',
      criteriaByCoverage: [],
    },
  ],
  classifications: [
    {
      id: 'cls-z',
      key: 'IRRELEVANTE',
      label: 'Irrelevante',
      abbreviation: 'I',
      color: '#0f0',
      sortOrder: 2,
      compatibilityBands: [2, 1],
    },
    {
      id: 'cls-a',
      key: 'ATENCAO',
      label: 'De Atenção',
      abbreviation: 'DA',
      color: '#FFAA00',
      sortOrder: 1,
      compatibilityBands: [3],
    },
  ],
  cells: [
    { id: 'cell-1', severity: 1, probability: 1, classificationId: 'cls-a' },
  ],
} as Pick<
  RiskMatrixVersion,
  'axisLevels' | 'classifications' | 'cells' | 'coverages' | 'gridOrientation' | 'yAxisDirection'
>);

assert.deepEqual(
  persisted.axisLevels.map((item) => item.label),
  ['Moderada', 'Muito Baixa'],
);
assert.deepEqual(persisted.axisLevels[0].criteriaByCoverage, {
  [RiskMatrixCoverageKeyEnum.FIS]: 'critério 2',
});
assert.equal(
  persisted.gridOrientation,
  RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
);
assert.equal(
  persisted.yAxisDirection,
  RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM,
);
assert.deepEqual(
  persisted.classifications.map((item) => item.key),
  ['ATENCAO', 'IRRELEVANTE'],
);
assert.deepEqual(persisted.classifications[0].compatibilityBands, [3]);
assert.deepEqual(persisted.classifications[1].compatibilityBands, [1, 2]);
assert.equal(persisted.classifications[1].color, '#00FF00');
assert.deepEqual(persisted.cells, [
  { severity: 1, probability: 1, classificationKey: 'ATENCAO' },
]);

const independentCriteria = hydrateEditorState({
  coverages: [
    RiskMatrixCoverageKeyEnum.FIS,
    RiskMatrixCoverageKeyEnum.QUI,
    RiskMatrixCoverageKeyEnum.BIO,
  ],
  axisLevels: [
    {
      id: 'p3',
      axis: RiskMatrixAxisEnum.PROBABILITY,
      value: 3,
      label: 'Ocasional',
      criteriaByCoverage: [
        { coverageKey: RiskMatrixCoverageKeyEnum.FIS, criterion: 'ruído contínuo' },
        { coverageKey: RiskMatrixCoverageKeyEnum.QUI, criterion: 'exposição a vapor' },
        { coverageKey: RiskMatrixCoverageKeyEnum.BIO, criterion: 'contato com fluido' },
      ],
    },
  ],
  classifications: [],
  cells: [],
} as Pick<RiskMatrixVersion, 'axisLevels' | 'classifications' | 'cells' | 'coverages'>);

assert.deepEqual(independentCriteria.axisLevels[0].criteriaByCoverage, {
  [RiskMatrixCoverageKeyEnum.FIS]: 'ruído contínuo',
  [RiskMatrixCoverageKeyEnum.QUI]: 'exposição a vapor',
  [RiskMatrixCoverageKeyEnum.BIO]: 'contato com fluido',
});
assert.equal(
  getAxisLevelCriterion(
    independentCriteria.axisLevels,
    RiskMatrixAxisEnum.PROBABILITY,
    3,
    RiskMatrixCoverageKeyEnum.FIS,
  ),
  'ruído contínuo',
);

const copied = copyAxisLevelCriterionToOtherCoverages(
  independentCriteria.axisLevels,
  RiskMatrixAxisEnum.PROBABILITY,
  3,
  RiskMatrixCoverageKeyEnum.FIS,
  [
    RiskMatrixCoverageKeyEnum.FIS,
    RiskMatrixCoverageKeyEnum.QUI,
    RiskMatrixCoverageKeyEnum.BIO,
  ],
);
assert.equal(
  getAxisLevelCriterion(copied, RiskMatrixAxisEnum.PROBABILITY, 3, RiskMatrixCoverageKeyEnum.QUI),
  'ruído contínuo',
);
assert.equal(
  getAxisLevelCriterion(copied, RiskMatrixAxisEnum.PROBABILITY, 3, RiskMatrixCoverageKeyEnum.BIO),
  'ruído contínuo',
);

const afterIndependentEdit = updateAxisLevelCriterion(
  copied,
  RiskMatrixAxisEnum.PROBABILITY,
  3,
  RiskMatrixCoverageKeyEnum.QUI,
  'texto químico próprio',
);
assert.equal(
  getAxisLevelCriterion(
    afterIndependentEdit,
    RiskMatrixAxisEnum.PROBABILITY,
    3,
    RiskMatrixCoverageKeyEnum.FIS,
  ),
  'ruído contínuo',
);
assert.equal(
  getAxisLevelCriterion(
    afterIndependentEdit,
    RiskMatrixAxisEnum.PROBABILITY,
    3,
    RiskMatrixCoverageKeyEnum.QUI,
  ),
  'texto químico próprio',
);
assert.equal(
  getAxisLevelCriterion(
    afterIndependentEdit,
    RiskMatrixAxisEnum.PROBABILITY,
    3,
    RiskMatrixCoverageKeyEnum.BIO,
  ),
  'ruído contínuo',
);

const withQuiFilled = afterIndependentEdit;
assert.equal(hasFilledCriteriaForCoverage(withQuiFilled, RiskMatrixCoverageKeyEnum.QUI), true);
const coveragesWithoutQui = toggleCoverage(
  [
    RiskMatrixCoverageKeyEnum.FIS,
    RiskMatrixCoverageKeyEnum.QUI,
    RiskMatrixCoverageKeyEnum.BIO,
  ],
  RiskMatrixCoverageKeyEnum.QUI,
);
assert.deepEqual(coveragesWithoutQui, [
  RiskMatrixCoverageKeyEnum.FIS,
  RiskMatrixCoverageKeyEnum.BIO,
]);
assert.equal(
  getAxisLevelCriterion(
    withQuiFilled,
    RiskMatrixAxisEnum.PROBABILITY,
    3,
    RiskMatrixCoverageKeyEnum.QUI,
  ),
  'texto químico próprio',
);
const remarcadas = toggleCoverage(coveragesWithoutQui, RiskMatrixCoverageKeyEnum.QUI);
assert.ok(remarcadas.includes(RiskMatrixCoverageKeyEnum.QUI));
assert.equal(
  getAxisLevelCriterion(
    withQuiFilled,
    RiskMatrixAxisEnum.PROBABILITY,
    3,
    RiskMatrixCoverageKeyEnum.QUI,
  ),
  'texto químico próprio',
);

const moved = moveClassification(emptyHydrated.classifications, 'C2', 'up');
assert.deepEqual(
  moved.map((item) => item.key),
  ['C2', 'C1', 'C3', 'C4'],
);
assert.deepEqual(
  moved.map((item) => item.sortOrder),
  [1, 2, 3, 4],
);

const five = setClassificationCount(emptyHydrated.classifications, 5);
assert.deepEqual(
  five.map((item) => item.key),
  ['C1', 'C2', 'C3', 'C4', 'C5'],
);
const fourAgain = setClassificationCount(five, 4);
assert.deepEqual(
  fourAgain.map((item) => item.key),
  ['C1', 'C2', 'C3', 'C4'],
);
const removed = removeClassification(five, 'C2');
assert.deepEqual(
  removed.map((item) => item.key),
  ['C1', 'C3', 'C4', 'C5'],
);
assert.equal(nextClassificationKey(removed), 'C6');

const withCoverage = toggleCoverage([], RiskMatrixCoverageKeyEnum.FIS);
assert.deepEqual(withCoverage, [RiskMatrixCoverageKeyEnum.FIS]);
assert.deepEqual(toggleCoverage(withCoverage, RiskMatrixCoverageKeyEnum.FIS), []);

const nByM = cartesianCoordinatesFromAxisLevels([
  { axis: RiskMatrixAxisEnum.SEVERITY, value: 1, label: 'A', criteriaByCoverage: {} },
  { axis: RiskMatrixAxisEnum.SEVERITY, value: 3, label: 'B', criteriaByCoverage: {} },
  { axis: RiskMatrixAxisEnum.SEVERITY, value: 2, label: 'C', criteriaByCoverage: {} },
  { axis: RiskMatrixAxisEnum.PROBABILITY, value: 2, label: 'X', criteriaByCoverage: {} },
  { axis: RiskMatrixAxisEnum.PROBABILITY, value: 1, label: 'Y', criteriaByCoverage: {} },
]);
assert.equal(nByM.length, 6);
assert.deepEqual(nByM[0], { severity: 1, probability: 1 });
assert.deepEqual(nByM[nByM.length - 1], { severity: 3, probability: 2 });

const probabilityOnX = getGridPresentation(
  RiskMatrixGridOrientationEnum.PROBABILITY_ON_X,
);
assert.equal(probabilityOnX.xAxis, RiskMatrixAxisEnum.PROBABILITY);
assert.equal(probabilityOnX.yAxis, RiskMatrixAxisEnum.SEVERITY);
const severityOnX = getGridPresentation(RiskMatrixGridOrientationEnum.SEVERITY_ON_X);
assert.equal(severityOnX.xAxis, RiskMatrixAxisEnum.SEVERITY);
assert.equal(severityOnX.yAxis, RiskMatrixAxisEnum.PROBABILITY);

const canonicalFromProbabilityOnX = coordinateFromGridPresentation(
  RiskMatrixGridOrientationEnum.PROBABILITY_ON_X,
  4,
  2,
);
const canonicalFromSeverityOnX = coordinateFromGridPresentation(
  RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
  2,
  4,
);
assert.deepEqual(canonicalFromProbabilityOnX, { severity: 2, probability: 4 });
assert.deepEqual(canonicalFromSeverityOnX, { severity: 2, probability: 4 });

const severityLevels = getAxisLevelsByAxis(emptySeed, RiskMatrixAxisEnum.SEVERITY);
const probabilityLevels = getAxisLevelsByAxis(emptySeed, RiskMatrixAxisEnum.PROBABILITY);
const presentedAxes = [
  {
    orientation: RiskMatrixGridOrientationEnum.PROBABILITY_ON_X,
    yAxisDirection: RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM,
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 3, 4, 5],
    xAxis: RiskMatrixAxisEnum.PROBABILITY,
    yAxis: RiskMatrixAxisEnum.SEVERITY,
  },
  {
    orientation: RiskMatrixGridOrientationEnum.PROBABILITY_ON_X,
    yAxisDirection: RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
    x: [1, 2, 3, 4, 5],
    y: [5, 4, 3, 2, 1],
    xAxis: RiskMatrixAxisEnum.PROBABILITY,
    yAxis: RiskMatrixAxisEnum.SEVERITY,
  },
  {
    orientation: RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
    yAxisDirection: RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM,
    x: [1, 2, 3, 4, 5],
    y: [1, 2, 3, 4, 5],
    xAxis: RiskMatrixAxisEnum.SEVERITY,
    yAxis: RiskMatrixAxisEnum.PROBABILITY,
  },
  {
    orientation: RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
    yAxisDirection: RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
    x: [1, 2, 3, 4, 5],
    y: [5, 4, 3, 2, 1],
    xAxis: RiskMatrixAxisEnum.SEVERITY,
    yAxis: RiskMatrixAxisEnum.PROBABILITY,
  },
] as const;

for (const caseItem of presentedAxes) {
  const presented = getPresentedGridAxes({
    severityLevels,
    probabilityLevels,
    orientation: caseItem.orientation,
    yAxisDirection: caseItem.yAxisDirection,
  });
  assert.equal(presented.xAxis, caseItem.xAxis);
  assert.equal(presented.yAxis, caseItem.yAxis);
  assert.deepEqual(
    presented.xLevels.map((level) => level.value),
    caseItem.x,
  );
  assert.deepEqual(
    presented.yLevels.map((level) => level.value),
    caseItem.y,
  );
  const xValue =
    caseItem.orientation === RiskMatrixGridOrientationEnum.SEVERITY_ON_X ? 2 : 4;
  const yValue =
    caseItem.orientation === RiskMatrixGridOrientationEnum.SEVERITY_ON_X ? 4 : 2;
  assert.deepEqual(
    coordinateFromGridPresentation(caseItem.orientation, xValue, yValue),
    { severity: 2, probability: 4 },
  );
}

const canonicalS2P4 = { severity: 2, probability: 4 };
assert.deepEqual(
  coordinateFromGridPresentation(RiskMatrixGridOrientationEnum.PROBABILITY_ON_X, 4, 2),
  canonicalS2P4,
);
assert.deepEqual(
  coordinateFromGridPresentation(RiskMatrixGridOrientationEnum.SEVERITY_ON_X, 2, 4),
  canonicalS2P4,
);

const invalid = validateEditorState(emptyHydrated);
assert.equal(invalid.structuralComplete, false);
assert.equal(invalid.readyForPublish, false);
assert.equal(invalid.missingCoverages, true);
assert.equal(invalid.missingSeverityLabels, true);
assert.ok(invalid.messages.includes('Nome da matriz é obrigatório.'));

const structuralState = {
  name: 'Matriz BIO',
  description: '',
  coverages: [RiskMatrixCoverageKeyEnum.BIO],
  gridOrientation: RiskMatrixGridOrientationEnum.PROBABILITY_ON_X,
  yAxisDirection: RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
  axisLevels: createEmptyV1EditorAxisLevels().map((level) => ({
    ...level,
    label: `Nível ${level.value}`,
  })),
  classifications: [
    { key: 'C1', label: 'Irrelevante', abbreviation: 'I', color: '#111111', sortOrder: 1, compatibilityBands: [1, 2] },
    { key: 'C2', label: 'De Atenção', abbreviation: 'DA', color: '#222222', sortOrder: 2, compatibilityBands: [3] },
    { key: 'C3', label: 'Crítico', abbreviation: 'C', color: '#333333', sortOrder: 3, compatibilityBands: [4] },
    { key: 'C4', label: 'Não Tolerável', abbreviation: 'NT', color: '#444444', sortOrder: 4, compatibilityBands: [5] },
  ],
  cells: [],
};
const readyStructural = validateEditorState(structuralState);
assert.equal(readyStructural.structuralComplete, true);
assert.equal(readyStructural.distributionComplete, false);
assert.equal(readyStructural.emptyCellCount, 25);
assert.equal(readyStructural.unusedClassificationCount, 4);
assert.equal(readyStructural.readyForPublish, false);
assert.equal(structuralState.classifications.length, 4);
assert.deepEqual(
  structuralState.classifications.map((item) => item.compatibilityBands),
  [[1, 2], [3], [4], [5]],
);

const fourWithoutBands = validateEditorState({
  ...structuralState,
  classifications: structuralState.classifications.map((item) => ({
    ...item,
    compatibilityBands: [],
  })),
});
assert.equal(fourWithoutBands.missingCompatibilityBands, true);
assert.equal(fourWithoutBands.structuralComplete, false);
assert.ok(
  fourWithoutBands.messages.includes(
    'Há classificação sem compatibilidade SimpleSST.',
  ),
);
assert.ok(
  fourWithoutBands.messages.some((message) =>
    message.startsWith('Faixa SimpleSST sem correspondência:'),
  ),
);

const duplicateBands = validateEditorState({
  coverages: [RiskMatrixCoverageKeyEnum.FIS],
  gridOrientation: RiskMatrixGridOrientationEnum.PROBABILITY_ON_X,
  yAxisDirection: RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
  axisLevels: createEmptyV1EditorAxisLevels().map((level) => ({
    ...level,
    label: `Nível ${level.value}`,
  })),
  classifications: [
    { key: 'C1', label: 'A', abbreviation: 'A', color: '#111111', sortOrder: 1, compatibilityBands: [1, 2] },
    { key: 'C2', label: 'B', abbreviation: 'B', color: '#222222', sortOrder: 2, compatibilityBands: [2, 3] },
    { key: 'C3', label: 'C', abbreviation: 'C', color: '#333333', sortOrder: 3, compatibilityBands: [4] },
    { key: 'C4', label: 'D', abbreviation: 'D', color: '#444444', sortOrder: 4, compatibilityBands: [5] },
  ],
  cells: [],
});
assert.equal(duplicateBands.duplicateCompatibilityBands, true);
assert.equal(duplicateBands.structuralComplete, false);
assert.ok(
  duplicateBands.messages.includes('Há faixa SimpleSST atribuída mais de uma vez.'),
);

const missingBand = validateEditorState({
  ...structuralState,
  classifications: [
    { key: 'C1', label: 'A', abbreviation: 'A', color: '#111111', sortOrder: 1, compatibilityBands: [1] },
    { key: 'C2', label: 'B', abbreviation: 'B', color: '#222222', sortOrder: 2, compatibilityBands: [3] },
    { key: 'C3', label: 'C', abbreviation: 'C', color: '#333333', sortOrder: 3, compatibilityBands: [4] },
    { key: 'C4', label: 'D', abbreviation: 'D', color: '#444444', sortOrder: 4, compatibilityBands: [5] },
  ],
});
assert.equal(missingBand.incompleteCompatibilityCoverage, true);
assert.deepEqual(missingBand.uncoveredCompatibilityBands, [2]);
assert.equal(missingBand.structuralComplete, false);
assert.ok(
  missingBand.messages.includes('Faixa SimpleSST sem correspondência: 2.'),
);

const invalidRange = validateEditorState({
  ...structuralState,
  classifications: [
    { key: 'C1', label: 'A', abbreviation: 'A', color: '#111111', sortOrder: 1, compatibilityBands: [0, 1] },
    { key: 'C2', label: 'B', abbreviation: 'B', color: '#222222', sortOrder: 2, compatibilityBands: [2] },
    { key: 'C3', label: 'C', abbreviation: 'C', color: '#333333', sortOrder: 3, compatibilityBands: [3] },
    { key: 'C4', label: 'D', abbreviation: 'D', color: '#444444', sortOrder: 4, compatibilityBands: [4, 5, 6] },
  ],
});
assert.equal(invalidRange.invalidCompatibilityValues, true);
assert.equal(invalidRange.structuralComplete, false);

const fiveComplete = validateEditorState({
  ...structuralState,
  classifications: [
    { key: 'C1', label: 'A', abbreviation: 'A', color: '#111111', sortOrder: 1, compatibilityBands: [1] },
    { key: 'C2', label: 'B', abbreviation: 'B', color: '#222222', sortOrder: 2, compatibilityBands: [2] },
    { key: 'C3', label: 'C', abbreviation: 'C', color: '#333333', sortOrder: 3, compatibilityBands: [3] },
    { key: 'C4', label: 'D', abbreviation: 'D', color: '#444444', sortOrder: 4, compatibilityBands: [4] },
    { key: 'C5', label: 'E', abbreviation: 'E', color: '#555555', sortOrder: 5, compatibilityBands: [5] },
  ],
});
assert.equal(fiveComplete.structuralComplete, true);
assert.equal(fiveComplete.missingCompatibilityBands, false);
assert.equal(fiveComplete.duplicateCompatibilityBands, false);
assert.equal(fiveComplete.incompleteCompatibilityCoverage, false);

const threeClasses = validateEditorState({
  ...structuralState,
  classifications: [
    { key: 'C1', label: 'A', abbreviation: 'A', color: '#111111', sortOrder: 1, compatibilityBands: [1, 2, 3] },
    { key: 'C2', label: 'B', abbreviation: 'B', color: '#222222', sortOrder: 2, compatibilityBands: [4] },
    { key: 'C3', label: 'C', abbreviation: 'C', color: '#333333', sortOrder: 3, compatibilityBands: [5] },
  ],
});
assert.equal(threeClasses.invalidClassificationCount, true);
assert.equal(threeClasses.structuralComplete, false);

const acelenBands = setClassificationCompatibilityBands(
  structuralState.classifications,
  'C1',
  [2, 1, 1],
);
assert.deepEqual(acelenBands[0].compatibilityBands, [1, 2]);
assert.equal(
  isCompatibilityBandUsedByOther(acelenBands, 'C2', 1),
  true,
);
assert.equal(
  isCompatibilityBandUsedByOther(acelenBands, 'C2', 3),
  false,
);
assert.equal(
  isCompatibilityBandUsedByOther(acelenBands, 'C1', 1),
  false,
);
assert.equal(
  isCompatibilityBandUsedByOther(acelenBands, 'C3', 5),
  true,
);

const axisSeed = createEmptyV1EditorAxisLevels();
const paintedOnce = paintEditorCell(
  [],
  axisSeed,
  { severity: 2, probability: 4 },
  'C1',
);
assert.deepEqual(paintedOnce, [
  { severity: 2, probability: 4, classificationKey: 'C1' },
]);
assert.deepEqual(
  structuralState.classifications.map((item) => item.compatibilityBands),
  [[1, 2], [3], [4], [5]],
);
assert.equal(
  structuralState.gridOrientation,
  RiskMatrixGridOrientationEnum.PROBABILITY_ON_X,
);
assert.equal(
  structuralState.yAxisDirection,
  RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
);
const paintedToggled = paintEditorCell(
  paintedOnce,
  axisSeed,
  { severity: 2, probability: 4 },
  'C1',
);
assert.deepEqual(paintedToggled, []);
const paintedReplaced = paintEditorCell(
  paintedOnce,
  axisSeed,
  { severity: 2, probability: 4 },
  'C2',
);
assert.deepEqual(paintedReplaced, [
  { severity: 2, probability: 4, classificationKey: 'C2' },
]);
assert.deepEqual(
  paintEditorCell(paintedOnce, axisSeed, { severity: 9, probability: 9 }, 'C1'),
  paintedOnce,
);

const paintedFromTransposedPresentation = paintEditorCell(
  [],
  axisSeed,
  coordinateFromGridPresentation(RiskMatrixGridOrientationEnum.SEVERITY_ON_X, 2, 4),
  'C1',
);
assert.deepEqual(paintedFromTransposedPresentation, paintedOnce);
const stillSameAfterOtherOrientation = paintEditorCell(
  paintedOnce,
  axisSeed,
  coordinateFromGridPresentation(RiskMatrixGridOrientationEnum.PROBABILITY_ON_X, 4, 2),
  'C1',
);
assert.deepEqual(stillSameAfterOtherOrientation, []);

const paintedAfterYFlip = paintEditorCell(
  paintedOnce,
  axisSeed,
  coordinateFromGridPresentation(RiskMatrixGridOrientationEnum.PROBABILITY_ON_X, 4, 2),
  'C1',
);
assert.deepEqual(paintedAfterYFlip, []);
const paintedAfterOrientationAndYFlip = paintEditorCell(
  paintedOnce,
  axisSeed,
  coordinateFromGridPresentation(RiskMatrixGridOrientationEnum.SEVERITY_ON_X, 2, 4),
  'C1',
);
assert.deepEqual(paintedAfterOrientationAndYFlip, []);

const usedCells = [
  { severity: 1, probability: 1, classificationKey: 'C5' },
];
const fiveClasses = setClassificationCount(emptyHydrated.classifications, 5);
const blockedRemove = tryRemoveClassification(fiveClasses, usedCells, 'C5');
assert.equal(blockedRemove.ok, false);
const allowedRemove = tryRemoveClassification(fiveClasses, usedCells, 'C2');
assert.equal(allowedRemove.ok, true);
if (allowedRemove.ok) {
  assert.deepEqual(
    allowedRemove.classifications.map((item) => item.key),
    ['C1', 'C3', 'C4', 'C5'],
  );
}

const blockedCount = trySetClassificationCount(fiveClasses, usedCells, 4);
assert.equal(blockedCount.ok, false);
const allowedCount = trySetClassificationCount(fiveClasses, [], 4);
assert.equal(allowedCount.ok, true);
if (allowedCount.ok) {
  assert.deepEqual(
    allowedCount.classifications.map((item) => item.key),
    ['C1', 'C2', 'C3', 'C4'],
  );
}

const dirtyAfterPaint = isEditorStateDirty(
  { ...emptyHydrated, cells: paintedOnce },
  emptyHydrated,
);
assert.equal(dirtyAfterPaint, true);
assert.equal(isEditorStateDirty(emptyHydrated, emptyHydrated), false);
assert.equal(
  isEditorStateDirty(
    {
      ...emptyHydrated,
      gridOrientation: RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
    },
    emptyHydrated,
  ),
  true,
);
assert.equal(
  isEditorStateDirty(
    {
      ...emptyHydrated,
      yAxisDirection: RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM,
    },
    emptyHydrated,
  ),
  true,
);
assert.equal(
  isEditorStateDirty(
    {
      ...emptyHydrated,
      name: 'Matriz de Riscos Químicos — ACELEN',
    },
    emptyHydrated,
  ),
  true,
);
assert.equal(
  isEditorStateDirty(
    {
      ...emptyHydrated,
      description: 'Nova descrição',
    },
    emptyHydrated,
  ),
  true,
);

const filledCells = cartesianCoordinatesFromAxisLevels(axisSeed).map(
  (coordinate, index) => ({
    ...coordinate,
    classificationKey: ['C1', 'C2', 'C3', 'C4'][index % 4],
  }),
);
const readyDistribution = validateEditorState({
  ...structuralState,
  cells: filledCells,
});
assert.equal(readyDistribution.structuralComplete, true);
assert.equal(readyDistribution.distributionComplete, true);
assert.equal(readyDistribution.emptyCellCount, 0);
assert.equal(readyDistribution.unusedClassificationCount, 0);
assert.equal(readyDistribution.readyForPublish, true);

const ignoredLegacyCriteria = hydrateEditorState({
  coverages: [RiskMatrixCoverageKeyEnum.FIS],
  axisLevels: [
    {
      id: 's1',
      axis: RiskMatrixAxisEnum.SEVERITY,
      value: 1,
      label: 'Baixa',
      criteria: 'texto legado ignorado',
      criteriaByCoverage: [
        { coverageKey: RiskMatrixCoverageKeyEnum.FIS, criterion: 'critério por cobertura' },
      ],
    },
  ],
  classifications: [],
  cells: [],
} as unknown as Pick<
  RiskMatrixVersion,
  'axisLevels' | 'classifications' | 'cells' | 'coverages'
>);
assert.deepEqual(ignoredLegacyCriteria.axisLevels[0].criteriaByCoverage, {
  [RiskMatrixCoverageKeyEnum.FIS]: 'critério por cobertura',
});
assert.equal(
  Object.prototype.hasOwnProperty.call(ignoredLegacyCriteria.axisLevels[0], 'criteria'),
  false,
);

assert.deepEqual(
  RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS.map((option) => option.value),
  [1, 2, 3, 4, 5],
);
assert.deepEqual(
  RISK_MATRIX_SIMPLE_SST_EQUIVALENCE_OPTIONS.map((option) => option.label),
  [
    '1 — Muito Baixo',
    '2 — Baixo',
    '3 — Moderado',
    '4 — Alto',
    '5 — Muito Alto',
  ],
);
assert.equal(
  RISK_MATRIX_SIMPLE_SST_HELP,
  'Indica quais faixas da escala padrão SimpleSST correspondem a esta classificação. É uma ponte de compatibilidade com funcionalidades que trabalham com os níveis 1 a 5 e não altera o cálculo desta matriz.',
);

const acelensEditor = {
  ...structuralState,
  name: 'Matriz de Riscos Físicos, Químicos e Biológicos — ACELEN — Cópia',
  description: 'Metodologia clonada',
  coverages: [
    RiskMatrixCoverageKeyEnum.FIS,
    RiskMatrixCoverageKeyEnum.QUI,
    RiskMatrixCoverageKeyEnum.BIO,
  ],
  gridOrientation: RiskMatrixGridOrientationEnum.SEVERITY_ON_X,
  yAxisDirection: RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM,
  axisLevels: structuralState.axisLevels.map((level) =>
    level.axis === RiskMatrixAxisEnum.SEVERITY && level.value === 4
      ? {
          ...level,
          criteriaByCoverage: {
            [RiskMatrixCoverageKeyEnum.FIS]: 'Lesão crítica física',
            [RiskMatrixCoverageKeyEnum.QUI]: 'Lesão crítica química',
            [RiskMatrixCoverageKeyEnum.BIO]: 'Classe 3 NR-32',
            [RiskMatrixCoverageKeyEnum.ACI]: 'não enviar',
          },
        }
      : level,
  ),
  classifications: [
    { key: 'IRRELEVANTE', label: 'Irrelevante', abbreviation: 'I', color: '#00AA00', sortOrder: 1, compatibilityBands: [2, 1] },
    { key: 'ATENCAO', label: 'De Atenção', abbreviation: 'DA', color: '#FFAA00', sortOrder: 2, compatibilityBands: [3] },
    { key: 'CRITICO', label: 'Crítico', abbreviation: 'C', color: '#FF5500', sortOrder: 3, compatibilityBands: [4] },
    { key: 'NAO_TOLERAVEL', label: 'Não Tolerável', abbreviation: 'NT', color: '#AA0000', sortOrder: 4, compatibilityBands: [5] },
  ],
  cells: [
    { severity: 2, probability: 4, classificationKey: 'IRRELEVANTE' },
    { severity: 1, probability: 1, classificationKey: null },
  ],
};
const putPayload = toReplaceDraftPayload(acelensEditor);
assert.equal(
  putPayload.name,
  'Matriz de Riscos Físicos, Químicos e Biológicos — ACELEN — Cópia',
);
assert.equal(putPayload.description, 'Metodologia clonada');
assert.equal(putPayload.gridOrientation, RiskMatrixGridOrientationEnum.SEVERITY_ON_X);
assert.equal(
  putPayload.yAxisDirection,
  RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM,
);
assert.deepEqual(putPayload.coverages, [
  RiskMatrixCoverageKeyEnum.FIS,
  RiskMatrixCoverageKeyEnum.QUI,
  RiskMatrixCoverageKeyEnum.BIO,
]);
assert.deepEqual(
  putPayload.classifications.map((item) => item.compatibilityBands),
  [[1, 2], [3], [4], [5]],
);
assert.deepEqual(
  putPayload.classifications.map((item) => item.abbreviation),
  ['I', 'DA', 'C', 'NT'],
);
assert.ok(
  putPayload.classifications.every(
    (item) => typeof item.abbreviation === 'string' && item.abbreviation.length > 0,
  ),
);
assert.deepEqual(putPayload.cells, [
  { severity: 2, probability: 4, classificationKey: 'IRRELEVANTE' },
]);
assert.deepEqual(putPayload.axisLevelColors, []);
const severity4 = putPayload.axisLevels.find(
  (level) => level.axis === RiskMatrixAxisEnum.SEVERITY && level.value === 4,
);
assert.deepEqual(severity4?.criteriaByCoverage, [
  { coverageKey: RiskMatrixCoverageKeyEnum.FIS, criterion: 'Lesão crítica física' },
  { coverageKey: RiskMatrixCoverageKeyEnum.QUI, criterion: 'Lesão crítica química' },
  { coverageKey: RiskMatrixCoverageKeyEnum.BIO, criterion: 'Classe 3 NR-32' },
]);

const baselineAfterHydrate = hydrateEditorState({
  coverages: putPayload.coverages,
  gridOrientation: putPayload.gridOrientation,
  yAxisDirection: putPayload.yAxisDirection,
  axisLevels: putPayload.axisLevels.map((level, index) => ({
    id: `ax-${index}`,
    axis: level.axis,
    value: level.value,
    label: level.label,
    criteriaByCoverage: level.criteriaByCoverage ?? [],
  })),
  classifications: putPayload.classifications.map((item, index) => ({
    id: `cl-${index}`,
    key: item.key,
    label: item.label,
    abbreviation: item.abbreviation,
    color: item.color,
    sortOrder: item.sortOrder,
    compatibilityBands: item.compatibilityBands,
  })),
  cells: putPayload.cells.map((cell, index) => ({
    id: `cell-${index}`,
    severity: cell.severity,
    probability: cell.probability,
    classificationId: `cl-${putPayload.classifications.findIndex((item) => item.key === cell.classificationKey)}`,
  })),
});
assert.deepEqual(
  baselineAfterHydrate.classifications.map((item) => item.abbreviation),
  ['I', 'DA', 'C', 'NT'],
);
assert.equal(isEditorStateDirty(acelensEditor, emptyHydrated), true);
assert.equal(isEditorStateDirty(baselineAfterHydrate, baselineAfterHydrate), false);
assert.equal(
  isEditorStateDirty(
    {
      ...baselineAfterHydrate,
      yAxisDirection: RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM,
    },
    baselineAfterHydrate,
  ),
  true,
);
const afterFailedSave = acelensEditor;
assert.equal(isEditorStateDirty(afterFailedSave, emptyHydrated), true);
assert.deepEqual(afterFailedSave.cells, acelensEditor.cells);

assert.equal(
  RISK_MATRIX_VERSION_STATUS_LABELS[CompanyRiskMatrixVersionStatusEnum.PUBLISHED],
  'Publicada',
);
assert.equal(
  RISK_MATRIX_PUBLISH_CONFIRMATION.title,
  'Publicar versão?',
);
assert.match(
  RISK_MATRIX_PUBLISH_CONFIRMATION.message,
  /não poderá mais ser editada/,
);
assert.match(
  RISK_MATRIX_PUBLISH_CONFIRMATION.message,
  /não disponibiliza automaticamente a matriz nos estabelecimentos/,
);
assert.equal(RISK_MATRIX_PUBLISH_CONFIRMATION.confirmText, 'Publicar versão');
assert.equal(RISK_MATRIX_PUBLISH_CONFIRMATION.cancelText, 'Cancelar');
assert.equal(
  RISK_MATRIX_PUBLISH_SAVE_FIRST_MESSAGE,
  'Salve o rascunho antes de publicar.',
);

assert.equal(
  shouldShowRiskMatrixPublishActions({
    status: CompanyRiskMatrixVersionStatusEnum.DRAFT,
    readOnly: false,
  }),
  true,
);
assert.equal(invalid.readyForPublish, false);
assert.equal(
  shouldShowRiskMatrixPublishActions({
    status: CompanyRiskMatrixVersionStatusEnum.PUBLISHED,
    readOnly: false,
  }),
  false,
);
assert.equal(
  shouldShowRiskMatrixPublishActions({
    status: CompanyRiskMatrixVersionStatusEnum.DRAFT,
    readOnly: true,
  }),
  false,
);

assert.equal(
  canAttemptPublishRiskMatrixVersion({
    status: CompanyRiskMatrixVersionStatusEnum.DRAFT,
    dirty: false,
    readOnly: false,
  }),
  true,
);
assert.equal(
  canAttemptPublishRiskMatrixVersion({
    status: CompanyRiskMatrixVersionStatusEnum.DRAFT,
    dirty: true,
    readOnly: false,
  }),
  false,
);
assert.equal(
  canAttemptPublishRiskMatrixVersion({
    status: CompanyRiskMatrixVersionStatusEnum.PUBLISHED,
    dirty: false,
    readOnly: true,
  }),
  false,
);

assert.equal(invalid.missingClassificationAbbreviations, true);

const lowercaseAbbrev = validateEditorState({
  ...structuralState,
  classifications: structuralState.classifications.map((item, index) =>
    index === 0 ? { ...item, abbreviation: ' i ' } : item,
  ),
});
assert.equal(lowercaseAbbrev.missingClassificationAbbreviations, false);
assert.equal(lowercaseAbbrev.invalidClassificationAbbreviations, false);
assert.deepEqual(lowercaseAbbrev.duplicateClassificationAbbreviations, []);
assert.equal(
  toReplaceDraftPayload({
    ...structuralState,
    classifications: structuralState.classifications.map((item, index) =>
      index === 0 ? { ...item, abbreviation: ' i ' } : item,
    ),
  }).classifications[0].abbreviation,
  'I',
);

const emptyAbbrev = validateEditorState({
  ...structuralState,
  classifications: structuralState.classifications.map((item, index) =>
    index === 0 ? { ...item, abbreviation: '' } : item,
  ),
});
assert.equal(emptyAbbrev.missingClassificationAbbreviations, true);
assert.equal(emptyAbbrev.structuralComplete, false);

const tooLongAbbrev = validateEditorState({
  ...structuralState,
  classifications: structuralState.classifications.map((item, index) =>
    index === 0 ? { ...item, abbreviation: 'TOOLONG' } : item,
  ),
});
assert.equal(tooLongAbbrev.invalidClassificationAbbreviations, true);

const duplicateAbbrev = validateEditorState({
  ...structuralState,
  classifications: structuralState.classifications.map((item, index) =>
    index === 1 ? { ...item, abbreviation: 'I' } : item,
  ),
});
assert.deepEqual(duplicateAbbrev.duplicateClassificationAbbreviations, ['I']);
assert.equal(duplicateAbbrev.structuralComplete, false);

const systemLookingAbbrev = validateEditorState({
  ...structuralState,
  classifications: [
    { ...structuralState.classifications[0], abbreviation: 'A' },
    { ...structuralState.classifications[1], abbreviation: 'M' },
    { ...structuralState.classifications[2], abbreviation: 'MA' },
    { ...structuralState.classifications[3], abbreviation: 'IA' },
  ],
});
assert.equal(systemLookingAbbrev.structuralComplete, true);
assert.deepEqual(systemLookingAbbrev.duplicateClassificationAbbreviations, []);

const createFromSystemLike = hydrateEditorState({
  coverages: [RiskMatrixCoverageKeyEnum.QUI],
  axisLevels: structuralState.axisLevels.map((level, index) => ({
    id: `ax-${index}`,
    axis: level.axis,
    value: level.value,
    label: level.label,
    criteriaByCoverage: [],
  })),
  classifications: [
    {
      id: 'c1',
      key: 'C1',
      label: 'Muito baixo',
      abbreviation: 'MB',
      color: '#00FF00',
      sortOrder: 1,
      compatibilityBands: [1],
    },
    {
      id: 'c2',
      key: 'C2',
      label: 'Baixo',
      abbreviation: 'B',
      color: '#AAFF00',
      sortOrder: 2,
      compatibilityBands: [2],
    },
    {
      id: 'c3',
      key: 'C3',
      label: 'Moderado',
      abbreviation: 'M',
      color: '#FFFF00',
      sortOrder: 3,
      compatibilityBands: [3],
    },
    {
      id: 'c4',
      key: 'C4',
      label: 'Alto',
      abbreviation: 'A',
      color: '#FF8800',
      sortOrder: 4,
      compatibilityBands: [4],
    },
    {
      id: 'c5',
      key: 'C5',
      label: 'Muito Alto',
      abbreviation: 'MA',
      color: '#FF0000',
      sortOrder: 5,
      compatibilityBands: [5],
    },
  ],
  cells: [],
});
assert.deepEqual(
  createFromSystemLike.classifications.map((item) => item.abbreviation),
  ['MB', 'B', 'M', 'A', 'MA'],
);
assert.deepEqual(
  toReplaceDraftPayload(createFromSystemLike).classifications.map(
    (item) => item.abbreviation,
  ),
  ['MB', 'B', 'M', 'A', 'MA'],
);

assert.equal(
  canAttemptPublishRiskMatrixVersion({
    status: CompanyRiskMatrixVersionStatusEnum.DRAFT,
    dirty: false,
    readOnly: true,
  }),
  false,
);

console.log('risk-matrix-editor-state.util.spec.ts OK');
