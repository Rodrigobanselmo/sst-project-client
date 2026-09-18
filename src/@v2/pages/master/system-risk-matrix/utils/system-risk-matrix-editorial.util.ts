import {
  RiskMatrixAxisEnum,
  RiskMatrixCoverageKeyEnum,
  type PutSystemRiskMatrixPayload,
  type SystemRiskMatrixAxisCriterion,
  type SystemRiskMatrixAxisLevelColor,
  type SystemRiskMatrixClassificationColor,
  type SystemRiskMatrixProjection,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import type { RiskMatrixEditorState } from '@v2/pages/companies/risk-matrices/utils/risk-matrix-editor-state.util';

const AXIS_VALUES = [1, 2, 3, 4, 5] as const;
const CLASSIFICATION_KEYS = ['C1', 'C2', 'C3', 'C4', 'C5'] as const;

export type SystemRiskMatrixEditorialState = PutSystemRiskMatrixPayload;

const criterionKey = (
  axis: RiskMatrixAxisEnum,
  value: number,
  coverageKey: RiskMatrixCoverageKeyEnum,
) => `${axis}:${value}:${coverageKey}`;

const flattenAxisCriteriaFromVersion = (
  projection: SystemRiskMatrixProjection,
): SystemRiskMatrixAxisCriterion[] =>
  projection.version.axisLevels.flatMap((level) =>
    (level.criteriaByCoverage ?? []).map((item) => ({
      axis: level.axis,
      value: level.value,
      coverageKey: item.coverageKey,
      criterion: item.criterion ?? '',
    })),
  );

const uniqueSharedAxisLevelColors = (
  colors: SystemRiskMatrixAxisLevelColor[],
): SystemRiskMatrixAxisLevelColor[] => {
  const byValue = new Map<number, string>();
  for (const item of colors) {
    if (!AXIS_VALUES.includes(item.value as (typeof AXIS_VALUES)[number])) {
      continue;
    }
    if (!byValue.has(item.value)) {
      byValue.set(item.value, item.color);
    }
  }

  return AXIS_VALUES.filter((value) => byValue.has(value)).map((value) => ({
    value,
    color: byValue.get(value) as string,
  }));
};

const uniqueClassificationColors = (
  colors: SystemRiskMatrixClassificationColor[],
): SystemRiskMatrixClassificationColor[] => {
  const byKey = new Map<string, string>();
  for (const item of colors) {
    if (!CLASSIFICATION_KEYS.includes(item.key as (typeof CLASSIFICATION_KEYS)[number])) {
      continue;
    }
    if (!byKey.has(item.key)) {
      byKey.set(item.key, item.color);
    }
  }

  return CLASSIFICATION_KEYS.filter((key) => byKey.has(key)).map((key) => ({
    key,
    color: byKey.get(key) as string,
  }));
};

export function buildSystemRiskMatrixEditorialState(
  projection: SystemRiskMatrixProjection,
): SystemRiskMatrixEditorialState {
  const axisCriteria = (
    projection.axisCriteria?.length
      ? projection.axisCriteria
      : flattenAxisCriteriaFromVersion(projection)
  ).map((item) => ({
    axis: item.axis,
    value: item.value,
    coverageKey: item.coverageKey,
    criterion: item.criterion ?? '',
  }));

  const axisLevelColors = uniqueSharedAxisLevelColors(
    projection.axisLevelColors?.length
      ? projection.axisLevelColors
      : projection.version.axisLevelColors ?? [],
  );

  const classificationColors = uniqueClassificationColors(
    projection.classificationColors?.length
      ? projection.classificationColors
      : projection.version.classifications.map((item) => ({
          key: item.key,
          color: item.color,
        })),
  );

  return {
    axisCriteria,
    axisLevelColors,
    classificationColors,
  };
}

export function buildSystemRiskMatrixPutPayload(
  editorial: SystemRiskMatrixEditorialState,
): PutSystemRiskMatrixPayload {
  return {
    axisCriteria: editorial.axisCriteria.map((item) => ({
      axis: item.axis,
      value: item.value,
      coverageKey: item.coverageKey,
      criterion: item.criterion,
    })),
    axisLevelColors: uniqueSharedAxisLevelColors(editorial.axisLevelColors),
    classificationColors: uniqueClassificationColors(
      editorial.classificationColors,
    ),
  };
}

export function isSystemRiskMatrixEditorialDirty(
  current: SystemRiskMatrixEditorialState,
  baseline: SystemRiskMatrixEditorialState,
) {
  return (
    JSON.stringify(buildSystemRiskMatrixPutPayload(current)) !==
    JSON.stringify(buildSystemRiskMatrixPutPayload(baseline))
  );
}

export function setSystemAxisCriterion(
  editorial: SystemRiskMatrixEditorialState,
  params: {
    axis: RiskMatrixAxisEnum;
    value: number;
    coverageKey: RiskMatrixCoverageKeyEnum;
    criterion: string;
  },
): SystemRiskMatrixEditorialState {
  const key = criterionKey(params.axis, params.value, params.coverageKey);
  return {
    ...editorial,
    axisCriteria: editorial.axisCriteria.map((item) =>
      criterionKey(item.axis, item.value, item.coverageKey) === key
        ? { ...item, criterion: params.criterion }
        : item,
    ),
  };
}

export function setSystemAxisLevelColor(
  editorial: SystemRiskMatrixEditorialState,
  value: number,
  color: string,
): SystemRiskMatrixEditorialState {
  return {
    ...editorial,
    axisLevelColors: uniqueSharedAxisLevelColors(
      editorial.axisLevelColors.map((item) =>
        item.value === value ? { ...item, color } : item,
      ),
    ),
  };
}

export function setSystemClassificationColor(
  editorial: SystemRiskMatrixEditorialState,
  key: string,
  color: string,
): SystemRiskMatrixEditorialState {
  return {
    ...editorial,
    classificationColors: uniqueClassificationColors(
      editorial.classificationColors.map((item) =>
        item.key === key ? { ...item, color } : item,
      ),
    ),
  };
}

export function toAxisLevelColorByValue(
  colors: SystemRiskMatrixAxisLevelColor[],
): Partial<Record<number, string>> {
  const next: Partial<Record<number, string>> = {};
  for (const item of uniqueSharedAxisLevelColors(colors)) {
    next[item.value] = item.color;
  }
  return next;
}

export function overlayEditorialOnEditorState(
  editor: RiskMatrixEditorState,
  editorial: SystemRiskMatrixEditorialState,
): RiskMatrixEditorState {
  const criterionByKey = new Map(
    editorial.axisCriteria.map((item) => [
      criterionKey(item.axis, item.value, item.coverageKey),
      item.criterion,
    ]),
  );
  const classificationColorByKey = new Map(
    editorial.classificationColors.map((item) => [item.key, item.color]),
  );

  return {
    ...editor,
    axisLevels: editor.axisLevels.map((level) => {
      const criteriaByCoverage = { ...level.criteriaByCoverage };
      for (const coverage of Object.values(RiskMatrixCoverageKeyEnum)) {
        const next = criterionByKey.get(
          criterionKey(level.axis, level.value, coverage),
        );
        if (next !== undefined) {
          criteriaByCoverage[coverage] = next;
        }
      }
      return { ...level, criteriaByCoverage };
    }),
    classifications: editor.classifications.map((classification) => ({
      ...classification,
      color:
        classificationColorByKey.get(classification.key) ?? classification.color,
    })),
  };
}

export function payloadHasForbiddenStructuralFields(
  payload: PutSystemRiskMatrixPayload,
) {
  const serialized = JSON.stringify(payload);
  return (
    'cells' in payload ||
    'coverages' in payload ||
    'gridOrientation' in payload ||
    'yAxisDirection' in payload ||
    'axisLevels' in payload ||
    serialized.includes('"probability":6') ||
    serialized.includes('"value":6')
  );
}
