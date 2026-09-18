import {
  CompanyRiskMatrixVersionStatusEnum,
  RiskMatrixAxisEnum,
  RiskMatrixCoverageKeyEnum,
  RiskMatrixGridOrientationEnum,
  RiskMatrixYAxisDirectionEnum,
  type RiskMatrixClassification,
  type RiskMatrixVersion,
  type ReplaceRiskMatrixDraftPayload,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { isValidRiskMatrixHex, normalizeRiskMatrixHex } from './risk-matrix-hex.util';

export const V1_QUALITATIVE_VALUES = [1, 2, 3, 4, 5] as const;

export type RiskMatrixSimpleSstEquivalence = (typeof V1_QUALITATIVE_VALUES)[number];

export type RiskMatrixEditorAxisLevel = {
  axis: RiskMatrixAxisEnum;
  value: number;
  label: string;
  criteriaByCoverage: Partial<Record<RiskMatrixCoverageKeyEnum, string>>;
};

export type RiskMatrixEditorClassification = {
  key: string;
  label: string;
  color: string;
  sortOrder: number;
  compatibilityBands: number[];
};

export type RiskMatrixEditorCell = {
  severity: number;
  probability: number;
  classificationKey: string | null;
};

export type RiskMatrixEditorState = {
  coverages: RiskMatrixCoverageKeyEnum[];
  gridOrientation: RiskMatrixGridOrientationEnum;
  yAxisDirection: RiskMatrixYAxisDirectionEnum;
  axisLevels: RiskMatrixEditorAxisLevel[];
  classifications: RiskMatrixEditorClassification[];
  cells: RiskMatrixEditorCell[];
};

const CLASSIFICATION_KEY_PATTERN = /^C(\d+)$/;

const toEditorCriteriaByCoverage = (
  items: Array<{ coverageKey?: string; criterion?: string | null }> | null | undefined,
): Partial<Record<RiskMatrixCoverageKeyEnum, string>> => {
  const next: Partial<Record<RiskMatrixCoverageKeyEnum, string>> = {};
  for (const item of items ?? []) {
    const coverage = item.coverageKey as RiskMatrixCoverageKeyEnum | undefined;
    if (!coverage || !Object.values(RiskMatrixCoverageKeyEnum).includes(coverage)) {
      continue;
    }
    next[coverage] = item.criterion ?? '';
  }
  return next;
};

const serializeCriteriaByCoverage = (
  criteriaByCoverage: Partial<Record<RiskMatrixCoverageKeyEnum, string>>,
) =>
  Object.values(RiskMatrixCoverageKeyEnum)
    .filter((coverage) => coverage in criteriaByCoverage)
    .map((coverage) => ({
      coverageKey: coverage,
      criterion: criteriaByCoverage[coverage] ?? '',
    }));

export function createEmptyV1AxisLevels(
  axis: RiskMatrixAxisEnum,
): RiskMatrixEditorAxisLevel[] {
  return V1_QUALITATIVE_VALUES.map((value) => ({
    axis,
    value,
    label: '',
    criteriaByCoverage: {},
  }));
}

export function createEmptyV1EditorAxisLevels(): RiskMatrixEditorAxisLevel[] {
  return [
    ...createEmptyV1AxisLevels(RiskMatrixAxisEnum.SEVERITY),
    ...createEmptyV1AxisLevels(RiskMatrixAxisEnum.PROBABILITY),
  ];
}

export function getAxisLevelsByAxis(
  axisLevels: RiskMatrixEditorAxisLevel[],
  axis: RiskMatrixAxisEnum,
) {
  return axisLevels
    .filter((level) => level.axis === axis)
    .slice()
    .sort((a, b) => a.value - b.value);
}

export function cartesianCoordinatesFromAxisLevels(
  axisLevels: RiskMatrixEditorAxisLevel[],
) {
  const severityValues = getAxisLevelsByAxis(
    axisLevels,
    RiskMatrixAxisEnum.SEVERITY,
  ).map((level) => level.value);
  const probabilityValues = getAxisLevelsByAxis(
    axisLevels,
    RiskMatrixAxisEnum.PROBABILITY,
  ).map((level) => level.value);

  const coordinates: Array<{ severity: number; probability: number }> = [];
  for (const severity of severityValues) {
    for (const probability of probabilityValues) {
      coordinates.push({ severity, probability });
    }
  }
  return coordinates;
}

export function nextClassificationKey(
  classifications: Array<{ key: string }>,
) {
  let max = 0;
  for (const classification of classifications) {
    const match = classification.key.match(CLASSIFICATION_KEY_PATTERN);
    if (!match) continue;
    max = Math.max(max, Number(match[1]));
  }
  return `C${max + 1}`;
}

export function createEmptyClassification(
  classifications: RiskMatrixEditorClassification[],
): RiskMatrixEditorClassification {
  return {
    key: nextClassificationKey(classifications),
    label: '',
    color: '',
    sortOrder: classifications.length + 1,
    compatibilityBands: [],
  };
}

export function createEmptyClassifications(count: 4 | 5) {
  const classifications: RiskMatrixEditorClassification[] = [];
  for (let index = 0; index < count; index += 1) {
    classifications.push(createEmptyClassification(classifications));
  }
  return reindexClassificationSortOrder(classifications);
}

export function reindexClassificationSortOrder(
  classifications: RiskMatrixEditorClassification[],
) {
  return classifications.map((classification, index) => ({
    ...classification,
    sortOrder: index + 1,
  }));
}

export function moveClassification(
  classifications: RiskMatrixEditorClassification[],
  key: string,
  direction: 'up' | 'down',
) {
  const index = classifications.findIndex((item) => item.key === key);
  if (index < 0) return classifications;

  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= classifications.length) return classifications;

  const next = classifications.slice();
  const [removed] = next.splice(index, 1);
  next.splice(target, 0, removed);
  return reindexClassificationSortOrder(next);
}

export function removeClassification(
  classifications: RiskMatrixEditorClassification[],
  key: string,
) {
  return reindexClassificationSortOrder(
    classifications.filter((item) => item.key !== key),
  );
}

export function isClassificationUsedInCells(
  cells: RiskMatrixEditorCell[],
  key: string,
) {
  return cells.some((cell) => cell.classificationKey === key);
}

export type ClassificationMutationResult =
  | { ok: true; classifications: RiskMatrixEditorClassification[] }
  | { ok: false; reason: string };

export function tryRemoveClassification(
  classifications: RiskMatrixEditorClassification[],
  cells: RiskMatrixEditorCell[],
  key: string,
): ClassificationMutationResult {
  if (classifications.length <= 4) {
    return {
      ok: false,
      reason: 'A matriz precisa de pelo menos 4 classificações.',
    };
  }

  if (isClassificationUsedInCells(cells, key)) {
    return {
      ok: false,
      reason:
        'Despinte as células desta classificação antes de removê-la. O critério do eixo não é o resultado da célula.',
    };
  }

  return {
    ok: true,
    classifications: removeClassification(classifications, key),
  };
}

export function setClassificationCount(
  classifications: RiskMatrixEditorClassification[],
  count: 4 | 5,
) {
  if (count === classifications.length) return classifications;

  if (count > classifications.length) {
    let next = classifications.slice();
    while (next.length < count) {
      next = [...next, createEmptyClassification(next)];
    }
    return reindexClassificationSortOrder(next);
  }

  return reindexClassificationSortOrder(classifications.slice(0, count));
}

export function trySetClassificationCount(
  classifications: RiskMatrixEditorClassification[],
  cells: RiskMatrixEditorCell[],
  count: 4 | 5,
): ClassificationMutationResult {
  if (count === classifications.length) {
    return { ok: true, classifications };
  }

  if (count > classifications.length) {
    return {
      ok: true,
      classifications: setClassificationCount(classifications, count),
    };
  }

  const removed = classifications.slice(count);
  if (removed.some((item) => isClassificationUsedInCells(cells, item.key))) {
    return {
      ok: false,
      reason:
        'Despinte as células da classificação que será removida antes de reduzir para 4 classes.',
    };
  }

  return {
    ok: true,
    classifications: setClassificationCount(classifications, count),
  };
}

export function cellCoordinateKey(severity: number, probability: number) {
  return `${severity}:${probability}`;
}

export function getCellClassificationKey(
  cells: RiskMatrixEditorCell[],
  severity: number,
  probability: number,
) {
  return (
    cells.find(
      (cell) =>
        cell.severity === severity && cell.probability === probability,
    )?.classificationKey ?? null
  );
}

export function paintEditorCell(
  cells: RiskMatrixEditorCell[],
  axisLevels: RiskMatrixEditorAxisLevel[],
  coordinate: { severity: number; probability: number },
  classificationKey: string | null,
) {
  const allowed = new Set(
    cartesianCoordinatesFromAxisLevels(axisLevels).map((item) =>
      cellCoordinateKey(item.severity, item.probability),
    ),
  );
  const pair = cellCoordinateKey(coordinate.severity, coordinate.probability);
  if (!allowed.has(pair)) return cells;

  const currentKey = getCellClassificationKey(
    cells,
    coordinate.severity,
    coordinate.probability,
  );
  const nextKey =
    classificationKey && currentKey === classificationKey
      ? null
      : classificationKey;

  const without = cells.filter(
    (cell) =>
      !(
        cell.severity === coordinate.severity &&
        cell.probability === coordinate.probability
      ),
  );

  if (!nextKey) return without;

  return [
    ...without,
    {
      severity: coordinate.severity,
      probability: coordinate.probability,
      classificationKey: nextKey,
    },
  ];
}

export function toggleCoverage(
  coverages: RiskMatrixCoverageKeyEnum[],
  coverage: RiskMatrixCoverageKeyEnum,
) {
  if (coverages.includes(coverage)) {
    return coverages.filter((item) => item !== coverage);
  }
  return [...coverages, coverage];
}

export function updateAxisLevel(
  axisLevels: RiskMatrixEditorAxisLevel[],
  axis: RiskMatrixAxisEnum,
  value: number,
  patch: Partial<Pick<RiskMatrixEditorAxisLevel, 'label'>>,
) {
  return axisLevels.map((level) =>
    level.axis === axis && level.value === value
      ? { ...level, ...patch }
      : level,
  );
}

export function getAxisLevelCriterion(
  axisLevels: RiskMatrixEditorAxisLevel[],
  axis: RiskMatrixAxisEnum,
  value: number,
  coverage: RiskMatrixCoverageKeyEnum,
) {
  return (
    axisLevels.find((level) => level.axis === axis && level.value === value)
      ?.criteriaByCoverage[coverage] ?? ''
  );
}

export function updateAxisLevelCriterion(
  axisLevels: RiskMatrixEditorAxisLevel[],
  axis: RiskMatrixAxisEnum,
  value: number,
  coverage: RiskMatrixCoverageKeyEnum,
  criterion: string,
) {
  return axisLevels.map((level) => {
    if (level.axis !== axis || level.value !== value) return level;
    return {
      ...level,
      criteriaByCoverage: {
        ...level.criteriaByCoverage,
        [coverage]: criterion,
      },
    };
  });
}

export function copyAxisLevelCriterionToOtherCoverages(
  axisLevels: RiskMatrixEditorAxisLevel[],
  axis: RiskMatrixAxisEnum,
  value: number,
  sourceCoverage: RiskMatrixCoverageKeyEnum,
  coverages: RiskMatrixCoverageKeyEnum[],
) {
  const sourceText = getAxisLevelCriterion(axisLevels, axis, value, sourceCoverage);

  return axisLevels.map((level) => {
    if (level.axis !== axis || level.value !== value) return level;

    const next = { ...level.criteriaByCoverage };
    for (const coverage of coverages) {
      if (coverage === sourceCoverage) continue;
      next[coverage] = sourceText;
    }
    return { ...level, criteriaByCoverage: next };
  });
}

export function hasFilledCriteriaForCoverage(
  axisLevels: RiskMatrixEditorAxisLevel[],
  coverage: RiskMatrixCoverageKeyEnum,
) {
  return axisLevels.some((level) => Boolean(level.criteriaByCoverage[coverage]?.trim()));
}

export function normalizeGridOrientation(
  value: RiskMatrixGridOrientationEnum | string | null | undefined,
) {
  if (value === RiskMatrixGridOrientationEnum.SEVERITY_ON_X) {
    return RiskMatrixGridOrientationEnum.SEVERITY_ON_X;
  }
  return RiskMatrixGridOrientationEnum.PROBABILITY_ON_X;
}

export function normalizeYAxisDirection(
  value: RiskMatrixYAxisDirectionEnum | string | null | undefined,
) {
  if (value === RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM) {
    return RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM;
  }
  return RiskMatrixYAxisDirectionEnum.DESCENDING_TOP_TO_BOTTOM;
}

export function getGridPresentation(
  orientation: RiskMatrixGridOrientationEnum,
) {
  if (orientation === RiskMatrixGridOrientationEnum.SEVERITY_ON_X) {
    return {
      xAxis: RiskMatrixAxisEnum.SEVERITY,
      yAxis: RiskMatrixAxisEnum.PROBABILITY,
      xTitle: 'Severidade',
      yTitle: 'Probabilidade',
    };
  }

  return {
    xAxis: RiskMatrixAxisEnum.PROBABILITY,
    yAxis: RiskMatrixAxisEnum.SEVERITY,
    xTitle: 'Probabilidade',
    yTitle: 'Severidade',
  };
}

export function getPresentedGridAxes(params: {
  severityLevels: RiskMatrixEditorAxisLevel[];
  probabilityLevels: RiskMatrixEditorAxisLevel[];
  orientation: RiskMatrixGridOrientationEnum;
  yAxisDirection: RiskMatrixYAxisDirectionEnum;
}) {
  const presentation = getGridPresentation(params.orientation);
  const xSource =
    presentation.xAxis === RiskMatrixAxisEnum.SEVERITY
      ? params.severityLevels
      : params.probabilityLevels;
  const ySource =
    presentation.yAxis === RiskMatrixAxisEnum.SEVERITY
      ? params.severityLevels
      : params.probabilityLevels;

  const xLevels = xSource.slice().sort((a, b) => a.value - b.value);
  const yAscending = ySource.slice().sort((a, b) => a.value - b.value);
  const yLevels =
    params.yAxisDirection === RiskMatrixYAxisDirectionEnum.ASCENDING_TOP_TO_BOTTOM
      ? yAscending
      : yAscending.slice().reverse();

  return {
    ...presentation,
    xLevels,
    yLevels,
  };
}

export function coordinateFromGridPresentation(
  orientation: RiskMatrixGridOrientationEnum,
  xValue: number,
  yValue: number,
) {
  if (orientation === RiskMatrixGridOrientationEnum.SEVERITY_ON_X) {
    return { severity: xValue, probability: yValue };
  }
  return { severity: yValue, probability: xValue };
}

export function isSimpleSstCompatibilityBand(
  value: number,
): value is RiskMatrixSimpleSstEquivalence {
  return (
    value === 1 || value === 2 || value === 3 || value === 4 || value === 5
  );
}

export function normalizeCompatibilityBands(bands: number[] | null | undefined) {
  return [...new Set(bands ?? [])]
    .filter(isSimpleSstCompatibilityBand)
    .sort((left, right) => left - right);
}

export function usedCompatibilityBandsExcept(
  classifications: RiskMatrixEditorClassification[],
  exceptKey: string,
) {
  const used = new Set<number>();
  for (const classification of classifications) {
    if (classification.key === exceptKey) continue;
    for (const band of classification.compatibilityBands) {
      used.add(band);
    }
  }
  return used;
}

export function isCompatibilityBandUsedByOther(
  classifications: RiskMatrixEditorClassification[],
  classificationKey: string,
  band: number,
) {
  return usedCompatibilityBandsExcept(classifications, classificationKey).has(
    band,
  );
}

export function setClassificationCompatibilityBands(
  classifications: RiskMatrixEditorClassification[],
  key: string,
  bands: number[],
) {
  return classifications.map((classification) =>
    classification.key === key
      ? {
          ...classification,
          compatibilityBands: normalizeCompatibilityBands(bands),
        }
      : classification,
  );
}

const toEditorClassification = (
  classification: RiskMatrixClassification,
): RiskMatrixEditorClassification => ({
  key: classification.key,
  label: classification.label ?? '',
  color: normalizeRiskMatrixHex(classification.color) ?? classification.color ?? '',
  sortOrder: classification.sortOrder,
  compatibilityBands: normalizeCompatibilityBands(classification.compatibilityBands),
});

export function hydrateEditorState(
  version: Pick<
    RiskMatrixVersion,
    'axisLevels' | 'classifications' | 'cells' | 'coverages' | 'gridOrientation' | 'yAxisDirection'
  >,
): RiskMatrixEditorState {
  const persistedAxisLevels = (version.axisLevels ?? []).map((level) => ({
    axis: level.axis,
    value: level.value,
    label: level.label ?? '',
    criteriaByCoverage: toEditorCriteriaByCoverage(level.criteriaByCoverage),
  }));

  const axisLevels = persistedAxisLevels.length
    ? persistedAxisLevels
    : createEmptyV1EditorAxisLevels();

  const classifications = (version.classifications ?? []).length
    ? [...version.classifications]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(toEditorClassification)
    : createEmptyClassifications(4);

  const classificationById = new Map(
    (version.classifications ?? []).map((item) => [item.id, item.key]),
  );

  const cells = (version.cells ?? []).map((cell) => ({
    severity: cell.severity,
    probability: cell.probability,
    classificationKey: classificationById.get(cell.classificationId) ?? null,
  }));

  return {
    coverages: [...(version.coverages ?? [])],
    gridOrientation: normalizeGridOrientation(version.gridOrientation),
    yAxisDirection: normalizeYAxisDirection(version.yAxisDirection),
    axisLevels,
    classifications,
    cells,
  };
}

export function serializeEditorState(state: RiskMatrixEditorState) {
  return JSON.stringify({
    coverages: [...state.coverages].sort(),
    gridOrientation: state.gridOrientation,
    yAxisDirection: state.yAxisDirection,
    axisLevels: state.axisLevels.map((level) => ({
      axis: level.axis,
      value: level.value,
      label: level.label,
      criteriaByCoverage: serializeCriteriaByCoverage(level.criteriaByCoverage),
    })),
    classifications: state.classifications.map((item) => ({
      key: item.key,
      label: item.label,
      color: item.color,
      sortOrder: item.sortOrder,
      compatibilityBands: item.compatibilityBands,
    })),
    cells: [...state.cells]
      .map((cell) => ({
        severity: cell.severity,
        probability: cell.probability,
        classificationKey: cell.classificationKey,
      }))
      .sort((a, b) =>
        cellCoordinateKey(a.severity, a.probability).localeCompare(
          cellCoordinateKey(b.severity, b.probability),
        ),
      ),
  });
}

export function isEditorStateDirty(
  current: RiskMatrixEditorState,
  baseline: RiskMatrixEditorState,
) {
  return serializeEditorState(current) !== serializeEditorState(baseline);
}

export function toReplaceDraftPayload(
  state: RiskMatrixEditorState,
): ReplaceRiskMatrixDraftPayload {
  return {
    gridOrientation: state.gridOrientation,
    yAxisDirection: state.yAxisDirection,
    coverages: [...state.coverages],
    axisLevels: state.axisLevels.map((level) => ({
      axis: level.axis,
      value: level.value,
      label: level.label,
      criteriaByCoverage: serializeCriteriaByCoverage(level.criteriaByCoverage).filter(
        (item) =>
          state.coverages.includes(item.coverageKey) && Boolean(item.criterion.trim()),
      ),
    })),
    classifications: state.classifications.map((item) => ({
      key: item.key,
      label: item.label,
      color: item.color,
      sortOrder: item.sortOrder,
      compatibilityBands: [...item.compatibilityBands].sort((left, right) => left - right),
    })),
    cells: [...state.cells]
      .filter((cell): cell is RiskMatrixEditorCell & { classificationKey: string } =>
        Boolean(cell.classificationKey),
      )
      .map((cell) => ({
        severity: cell.severity,
        probability: cell.probability,
        classificationKey: cell.classificationKey,
      })),
  };
}

export type RiskMatrixEditorValidation = {
  missingCoverages: boolean;
  missingSeverityLabels: boolean;
  missingProbabilityLabels: boolean;
  invalidClassificationCount: boolean;
  missingClassificationLabels: boolean;
  invalidColors: boolean;
  missingCompatibilityBands: boolean;
  duplicateCompatibilityBands: boolean;
  incompleteCompatibilityCoverage: boolean;
  invalidCompatibilityValues: boolean;
  uncoveredCompatibilityBands: number[];
  emptyCellCount: number;
  unusedClassificationCount: number;
  structuralComplete: boolean;
  distributionComplete: boolean;
  readyForPublish: boolean;
  messages: string[];
};

export function validateEditorState(
  state: RiskMatrixEditorState,
): RiskMatrixEditorValidation {
  const severity = getAxisLevelsByAxis(state.axisLevels, RiskMatrixAxisEnum.SEVERITY);
  const probability = getAxisLevelsByAxis(
    state.axisLevels,
    RiskMatrixAxisEnum.PROBABILITY,
  );

  const missingCoverages = state.coverages.length < 1;
  const missingSeverityLabels =
    severity.length !== V1_QUALITATIVE_VALUES.length ||
    severity.some((level) => !level.label.trim());
  const missingProbabilityLabels =
    probability.length !== V1_QUALITATIVE_VALUES.length ||
    probability.some((level) => !level.label.trim());
  const invalidClassificationCount =
    state.classifications.length !== 4 && state.classifications.length !== 5;
  const missingClassificationLabels = state.classifications.some(
    (item) => !item.label.trim(),
  );
  const invalidColors = state.classifications.some(
    (item) => !isValidRiskMatrixHex(item.color),
  );
  const missingCompatibilityBands = state.classifications.some(
    (item) => item.compatibilityBands.length === 0,
  );
  const assignedBands = state.classifications.flatMap(
    (item) => item.compatibilityBands,
  );
  const invalidCompatibilityValues = assignedBands.some(
    (band) => !isSimpleSstCompatibilityBand(band),
  );
  const duplicateCompatibilityBands =
    assignedBands.length !== new Set(assignedBands).size;
  const covered = new Set(
    assignedBands.filter(isSimpleSstCompatibilityBand),
  );
  const uncoveredCompatibilityBands = V1_QUALITATIVE_VALUES.filter(
    (band) => !covered.has(band),
  );
  const incompleteCompatibilityCoverage =
    uncoveredCompatibilityBands.length > 0;

  const coordinates = cartesianCoordinatesFromAxisLevels(state.axisLevels);
  const emptyCellCount = coordinates.filter(
    (coordinate) =>
      !getCellClassificationKey(
        state.cells,
        coordinate.severity,
        coordinate.probability,
      ),
  ).length;
  const usedKeys = new Set(
    state.cells
      .map((cell) => cell.classificationKey)
      .filter((key): key is string => Boolean(key)),
  );
  const unusedClassificationCount = state.classifications.filter(
    (item) => !usedKeys.has(item.key),
  ).length;

  const structuralComplete =
    !missingCoverages &&
    !missingSeverityLabels &&
    !missingProbabilityLabels &&
    !invalidClassificationCount &&
    !missingClassificationLabels &&
    !invalidColors &&
    !missingCompatibilityBands &&
    !duplicateCompatibilityBands &&
    !incompleteCompatibilityCoverage &&
    !invalidCompatibilityValues;
  const distributionComplete =
    structuralComplete &&
    coordinates.length > 0 &&
    emptyCellCount === 0 &&
    unusedClassificationCount === 0;

  const messages: string[] = [];
  if (missingCoverages) messages.push('Selecione pelo menos uma cobertura.');
  if (missingSeverityLabels) {
    messages.push('Preencha o nome dos 5 níveis de Severidade.');
  }
  if (missingProbabilityLabels) {
    messages.push('Preencha o nome dos 5 níveis de Probabilidade.');
  }
  if (invalidClassificationCount) {
    messages.push('A matriz precisa de 4 ou 5 classificações.');
  }
  if (missingClassificationLabels) {
    messages.push('Preencha o nome de todas as classificações.');
  }
  if (invalidColors) {
    messages.push('Informe uma cor hex válida (#RGB ou #RRGGBB) para cada classificação.');
  }
  if (missingCompatibilityBands) {
    messages.push('Há classificação sem compatibilidade SimpleSST.');
  }
  if (duplicateCompatibilityBands) {
    messages.push('Há faixa SimpleSST atribuída mais de uma vez.');
  }
  if (uncoveredCompatibilityBands.length > 0) {
    messages.push(
      `Faixa SimpleSST sem correspondência: ${uncoveredCompatibilityBands.join(', ')}.`,
    );
  }
  if (invalidCompatibilityValues) {
    messages.push('As faixas SimpleSST precisam ser valores de 1 a 5.');
  }
  if (structuralComplete && emptyCellCount > 0) {
    messages.push(
      `Pinte as combinações da matriz. Ainda faltam ${emptyCellCount} células.`,
    );
  }
  if (structuralComplete && emptyCellCount === 0 && unusedClassificationCount > 0) {
    messages.push(
      'Toda classificação precisa aparecer em pelo menos uma célula.',
    );
  }

  return {
    missingCoverages,
    missingSeverityLabels,
    missingProbabilityLabels,
    invalidClassificationCount,
    missingClassificationLabels,
    invalidColors,
    missingCompatibilityBands,
    duplicateCompatibilityBands,
    incompleteCompatibilityCoverage,
    invalidCompatibilityValues,
    uncoveredCompatibilityBands,
    emptyCellCount,
    unusedClassificationCount,
    structuralComplete,
    distributionComplete,
    readyForPublish: distributionComplete,
    messages,
  };
}

export function canAttemptPublishRiskMatrixVersion(params: {
  status?: CompanyRiskMatrixVersionStatusEnum;
  dirty: boolean;
  readOnly?: boolean;
}): boolean {
  return (
    params.status === CompanyRiskMatrixVersionStatusEnum.DRAFT &&
    !params.readOnly &&
    !params.dirty
  );
}

export function shouldShowRiskMatrixPublishActions(params: {
  status?: CompanyRiskMatrixVersionStatusEnum;
  readOnly?: boolean;
}): boolean {
  return (
    params.status === CompanyRiskMatrixVersionStatusEnum.DRAFT && !params.readOnly
  );
}
