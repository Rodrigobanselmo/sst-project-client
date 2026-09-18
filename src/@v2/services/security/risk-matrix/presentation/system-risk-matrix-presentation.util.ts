import { normalizeRiskMatrixHex } from '@v2/pages/companies/risk-matrices/utils/risk-matrix-hex.util';
import {
  RiskMatrixSourceEnum,
  type SystemRiskMatrixPresentation,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';
import { getSimpleSstScaleChipColors } from 'core/utils/helpers/simple-sst-scale-chip.util';

export type SystemPresentationChipColors = {
  bgcolor: string;
  color: string;
};

export type AcceptedSystemRiskMatrixPresentation = {
  source: RiskMatrixSourceEnum.SYSTEM;
  axisLevelColors: SystemRiskMatrixPresentation['axisLevelColors'];
  classifications: SystemRiskMatrixPresentation['classifications'];
  extraordinaryProbability?: SystemRiskMatrixPresentation['extraordinaryProbability'];
};

export type OccupationalChipFallback = 'scale' | 'action-plan-tag';

const ACTION_PLAN_TAG_FALLBACK: Record<number, SystemPresentationChipColors> = {
  0: {
    bgcolor: 'transparent',
    color: 'text.main',
  },
  1: { bgcolor: 'scale.low', color: 'white' },
  2: { bgcolor: 'scale.mediumLow', color: 'white' },
  3: { bgcolor: 'primary.main', color: 'text.dark' },
  4: { bgcolor: 'scale.mediumHigh', color: 'white' },
  5: { bgcolor: 'scale.high', color: 'white' },
  6: { bgcolor: 'scale.veryHigh', color: 'white' },
};

const systemClassificationKey = (level: number) => `C${level}`;

function contrastOnHex(hex: string) {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return '#111111';
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#111111' : '#FFFFFF';
}

function chipFromHex(hex: string | null | undefined): SystemPresentationChipColors | null {
  const normalized = normalizeRiskMatrixHex(hex);
  if (!normalized) return null;
  return { bgcolor: normalized, color: contrastOnHex(normalized) };
}

function scaleFallback(level?: number | null): SystemPresentationChipColors {
  return getSimpleSstScaleChipColors(level);
}

function actionPlanFallback(level?: number | null): SystemPresentationChipColors {
  if (typeof level === 'number' && ACTION_PLAN_TAG_FALLBACK[level]) {
    return ACTION_PLAN_TAG_FALLBACK[level];
  }
  return ACTION_PLAN_TAG_FALLBACK[0];
}

function occupationalFallback(
  level: number | null | undefined,
  fallback: OccupationalChipFallback,
): SystemPresentationChipColors {
  return fallback === 'action-plan-tag'
    ? actionPlanFallback(level)
    : scaleFallback(level);
}

function extraordinaryChip(
  presentation: AcceptedSystemRiskMatrixPresentation | null,
  fallback: OccupationalChipFallback,
): SystemPresentationChipColors {
  const fromPresentation = chipFromHex(
    presentation?.extraordinaryProbability?.color,
  );
  if (fromPresentation) return fromPresentation;
  return occupationalFallback(6, fallback);
}

/**
 * Gate SYSTEM-only. CUSTOM, source ausente ou payload incompleto
 * não entram na pintura editorial.
 */
export function acceptSystemRiskMatrixPresentation(
  input?: Partial<SystemRiskMatrixPresentation> | null,
): AcceptedSystemRiskMatrixPresentation | null {
  if (!input) return null;
  if (input.source !== RiskMatrixSourceEnum.SYSTEM) return null;
  if (!Array.isArray(input.axisLevelColors) || !Array.isArray(input.classifications)) {
    return null;
  }

  return {
    source: RiskMatrixSourceEnum.SYSTEM,
    axisLevelColors: input.axisLevelColors,
    classifications: input.classifications,
    extraordinaryProbability: input.extraordinaryProbability,
  };
}

export function resolveSystemAxisLevelChipColors(
  value: number | null | undefined,
  presentation: AcceptedSystemRiskMatrixPresentation | null,
): SystemPresentationChipColors {
  if (typeof value === 'number' && value >= 6) {
    return extraordinaryChip(presentation, 'scale');
  }

  if (presentation && typeof value === 'number' && value >= 1 && value <= 5) {
    const hex = presentation.axisLevelColors.find((item) => item.value === value)
      ?.color;
    const chip = chipFromHex(hex);
    if (chip) return chip;
  }

  return scaleFallback(value);
}

export function resolveSystemOccupationalChipColors(
  level: number | null | undefined,
  presentation: AcceptedSystemRiskMatrixPresentation | null,
  fallback: OccupationalChipFallback = 'scale',
): SystemPresentationChipColors {
  if (typeof level === 'number' && level >= 6) {
    return extraordinaryChip(presentation, fallback);
  }

  if (presentation && typeof level === 'number' && level >= 1 && level <= 5) {
    const key = systemClassificationKey(level);
    const hex = presentation.classifications.find((item) => item.key === key)
      ?.color;
    const chip = chipFromHex(hex);
    if (chip) return chip;
  }

  return occupationalFallback(level, fallback);
}
