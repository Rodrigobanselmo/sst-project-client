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

/**
 * RO para exibição no RiskTool.
 *
 * Quantitativo (`isQuantity` + `level` 1..6): `level` é autoridade — NÃO recalcular
 * via getMatrizRisk(severity, probability). O `probability` transitório espelha
 * quantitativeRiskLevel e NÃO é matrixProbability.
 *
 * Qualitativo: severity × probability → matriz S×P.
 */
export function resolveDisplayedOccupationalRisk(params: {
  isQuantity?: boolean | null;
  level?: number | null;
  severity?: number | null;
  probability?: number | null;
}): MatrixRiskMapEntry | null {
  const { isQuantity, level, severity, probability } = params;

  if (isQuantity) {
    const rounded =
      level != null && Number.isFinite(level) ? Math.round(level) : 0;
    if (rounded >= 1 && rounded <= 6) {
      return matrixRiskMap[rounded as 1 | 2 | 3 | 4 | 5 | 6];
    }
    return null;
  }

  return getMatrizRisk(severity ?? undefined, probability ?? undefined);
}
