import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import {
  resolveOccupationalRiskLevel,
  type OccupationalRiskLevel,
} from 'core/utils/helpers/occupational-risk-level.util';

/** Os cinco níveis ordinários da matriz SimpleSST, na ordem da escala. */
export const FRPS_OCCUPATIONAL_FILTER_LEVELS = [1, 2, 3, 4, 5] as const;

export function frpsOccupationalLevelLabel(level: OccupationalRiskLevel): string {
  return matrixRiskMap[level].label;
}

/**
 * Níveis finais distintos de um FRPS.
 * Uma probabilidade por agrupamento e uma por setor não agrupado.
 * Não informado fica de fora: não vira indicador nem conta no filtro restritivo.
 */
export function collectDistinctFrpsOccupationalLevels(params: {
  severity?: number;
  groupProbabilities: number[];
  ungroupedProbabilities: number[];
}): OccupationalRiskLevel[] {
  const levels = new Set<OccupationalRiskLevel>();

  for (const probability of [
    ...params.groupProbabilities,
    ...params.ungroupedProbabilities,
  ]) {
    const level = resolveOccupationalRiskLevel(params.severity, probability);
    if (level != null) levels.add(level);
  }

  return [...levels].sort((a, b) => a - b);
}

/**
 * Com os cinco níveis ativos, a lista permanece a atual (inclusive sem classificação).
 * Com seleção menor, o FRPS entra se alguma unidade tiver um nível selecionado.
 */
export function frpsPassesOccupationalFilter(params: {
  levels: readonly number[];
  selectedLevels: ReadonlySet<number>;
}): boolean {
  const restrictive =
    params.selectedLevels.size < FRPS_OCCUPATIONAL_FILTER_LEVELS.length;
  if (!restrictive) return true;
  return params.levels.some((level) => params.selectedLevels.has(level));
}
