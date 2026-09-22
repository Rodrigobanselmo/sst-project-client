import {
  matrixRisk,
  matrixRiskMap,
} from 'core/constants/maps/matriz-risk.constant';

/**
 * 0 = não informado.
 * 1..5 = resultados ordinários da matriz qualitativa 5x5.
 * 6 = estado extraordinário "Interromper atividades" (não é 6ª classe qualitativa).
 */
export type MatrixRiskLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Lookup numérico da matriz qualitativa SimpleSST (5x5). Não é P×S aritmético.
 *
 * Contrato semântico: resolveMatrixRiskLevel(severity, probability)
 * - ausência de S ou P → 0
 * - P,S ∈ {1…5} → matrixRisk[5 - P][S - 1] (25 células; resultados ordinários 1..5)
 * - P >= 6 → 6 (estado extraordinário Interromper atividades)
 */
export function resolveMatrixRiskLevel(
  severity?: number,
  probability?: number,
): MatrixRiskLevel {
  if (!severity || !probability) return 0;

  if (probability >= 6) return 6;

  const value = matrixRisk[5 - probability][
    severity - 1
  ] as MatrixRiskLevel | undefined;

  return value || 1;
}

/**
 * Wrapper de UI do lookup canônico.
 *
 * Contrato: getMatrizRisk(severity, probability)
 * Sem S ou P continua retornando `null` (comportamento atual das telas).
 */
export const getMatrizRisk = (severity?: number, probability?: number) => {
  if (!severity || !probability) return null;

  const level = resolveMatrixRiskLevel(severity, probability);

  return matrixRiskMap[level];
};

export type MatrixRiskMapEntry = (typeof matrixRiskMap)[keyof typeof matrixRiskMap];

/** Entrada de apresentação do RO (SYSTEM ou CUSTOM snapshotted). */
export type DisplayedOccupationalRisk = MatrixRiskMapEntry & {
  /** Hex CUSTOM do snapshot; SYSTEM/legado não preenche. */
  color?: string | null;
  /** true quando a apresentação veio do snapshot CUSTOM da API. */
  isCustomSnapshot?: boolean;
};

export type DisplayedOccupationalChipColors = {
  bgcolor: string;
  color: string;
};

const contrastOnHex = (hex: string) => {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return '#111111';
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return '#111111';
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#111111' : '#FFFFFF';
};

const normalizeHex = (hex?: string | null): string | null => {
  if (!hex || typeof hex !== 'string') return null;
  const trimmed = hex.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^[0-9A-Fa-f]{6}$/.test(trimmed)) return `#${trimmed.toUpperCase()}`;
  return null;
};

/** Chip a partir do hex CUSTOM; null se inválido. */
export function resolveDisplayedOccupationalChipColorsFromHex(
  hex?: string | null,
): DisplayedOccupationalChipColors | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  return { bgcolor: normalized, color: contrastOnHex(normalized) };
}

type QualitativeSnapshotInput = {
  matrixSource?: string | null;
  matrixVersionId?: string | null;
  matrixEvaluatedAt?: string | Date | null;
  resolvedLabel?: string | null;
  resolvedColor?: string | null;
  resolvedLegacyBand?: number | null;
  residualLabel?: string | null;
  residualColor?: string | null;
  residualLegacyBand?: number | null;
};

/**
 * Snapshot CUSTOM válido: source + versionId.
 * Não exige label — incompletude é tratada sem inventar SimpleSST.
 */
export function hasCustomMatrixSnapshot(
  params?: QualitativeSnapshotInput | null,
): boolean {
  if (!params) return false;
  return (
    params.matrixSource === 'CUSTOM' && Boolean(params.matrixVersionId)
  );
}

const normalizeOperationalLevel = (
  level?: number | null,
): MatrixRiskLevel | null => {
  if (level == null || !Number.isFinite(level)) return null;
  const rounded = Math.round(level);
  if (rounded >= 1 && rounded <= 6) return rounded as MatrixRiskLevel;
  return null;
};

const customEntryFromSnapshot = (params: {
  label?: string | null;
  color?: string | null;
  level?: number | null;
  legacyBand?: number | null;
}): DisplayedOccupationalRisk => {
  const level =
    normalizeOperationalLevel(params.legacyBand) ??
    normalizeOperationalLevel(params.level) ??
    0;
  const base = matrixRiskMap[level as keyof typeof matrixRiskMap] ?? matrixRiskMap[0];
  const label =
    typeof params.label === 'string' && params.label.trim().length > 0
      ? params.label
      : '--';

  return {
    ...base,
    level,
    label,
    short: label,
    color: params.color ?? null,
    isCustomSnapshot: true,
  };
};

/**
 * RO inerente para exibição no RiskTool.
 *
 * Quantitativo (`isQuantity` + `level` 1..6): `level` é autoridade — NÃO recalcular
 * via getMatrizRisk(severity, probability).
 *
 * CUSTOM snapshotted: resolvedLabel/resolvedColor da API; level só ponte operacional.
 * Nunca renomeia via matrixRiskMap[level].
 *
 * SYSTEM / legado sem snapshot: severity × probability → SimpleSST.
 */
export function resolveDisplayedOccupationalRisk(params: {
  isQuantity?: boolean | null;
  level?: number | null;
  severity?: number | null;
  probability?: number | null;
  matrixSource?: string | null;
  matrixVersionId?: string | null;
  matrixEvaluatedAt?: string | Date | null;
  resolvedLabel?: string | null;
  resolvedColor?: string | null;
  resolvedLegacyBand?: number | null;
}): DisplayedOccupationalRisk | null {
  const {
    isQuantity,
    level,
    severity,
    probability,
    matrixSource,
    matrixVersionId,
    matrixEvaluatedAt,
    resolvedLabel,
    resolvedColor,
    resolvedLegacyBand,
  } = params;

  if (isQuantity) {
    const rounded =
      level != null && Number.isFinite(level) ? Math.round(level) : 0;
    if (rounded >= 1 && rounded <= 6) {
      return {
        ...matrixRiskMap[rounded as 1 | 2 | 3 | 4 | 5 | 6],
        isCustomSnapshot: false,
      };
    }
    return null;
  }

  if (
    hasCustomMatrixSnapshot({
      matrixSource,
      matrixVersionId,
      matrixEvaluatedAt,
      resolvedLabel,
    })
  ) {
    return customEntryFromSnapshot({
      label: resolvedLabel,
      color: resolvedColor,
      level,
      legacyBand: resolvedLegacyBand,
    });
  }

  const system = getMatrizRisk(severity ?? undefined, probability ?? undefined);
  if (!system) return null;
  return { ...system, isCustomSnapshot: false };
}

/**
 * RO residual para exibição.
 *
 * CUSTOM com residual*: residualLabel/Color/LegacyBand da API.
 * SYSTEM / sem residual snapshot: getMatrizRisk(S, probabilityAfter).
 * Não altera a semântica de probabilityAfter.
 */
export function resolveDisplayedResidualOccupationalRisk(params: {
  isQuantity?: boolean | null;
  severity?: number | null;
  probabilityAfter?: number | null;
  matrixSource?: string | null;
  matrixVersionId?: string | null;
  matrixEvaluatedAt?: string | Date | null;
  residualLabel?: string | null;
  residualColor?: string | null;
  residualLegacyBand?: number | null;
}): DisplayedOccupationalRisk | null {
  const {
    severity,
    probabilityAfter,
    matrixSource,
    matrixVersionId,
    matrixEvaluatedAt,
    residualLabel,
    residualColor,
    residualLegacyBand,
  } = params;

  if (
    hasCustomMatrixSnapshot({
      matrixSource,
      matrixVersionId,
      matrixEvaluatedAt,
    })
  ) {
    // Sem residual snapshot: não inventar classification SimpleSST.
    if (
      residualLegacyBand == null &&
      !(typeof residualLabel === 'string' && residualLabel.trim())
    ) {
      return null;
    }

    return customEntryFromSnapshot({
      label: residualLabel,
      color: residualColor,
      level: residualLegacyBand,
      legacyBand: residualLegacyBand,
    });
  }

  const system = getMatrizRisk(
    severity ?? undefined,
    probabilityAfter ?? undefined,
  );
  if (!system) return null;
  return { ...system, isCustomSnapshot: false };
}
