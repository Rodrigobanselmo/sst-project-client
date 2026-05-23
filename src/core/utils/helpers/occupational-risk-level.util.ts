import { getMatrizRisk } from './matriz';

export type OccupationalRiskLevel = 1 | 2 | 3 | 4 | 5;

export const OCCUPATIONAL_RISK_LEVEL_NAMES: Record<
  OccupationalRiskLevel,
  string
> = {
  1: 'Muito Baixo',
  2: 'Baixo',
  3: 'Moderado',
  4: 'Alto',
  5: 'Muito Alto',
};

export type MassAddOccupationalRiskFilter =
  | 'all'
  | 'moderateAndAbove'
  | 'highAndAbove';

export type MassRemoveOccupationalRiskTarget = 'all' | OccupationalRiskLevel;

const isValidMatrixValue = (n: unknown): n is number =>
  typeof n === 'number' && Number.isFinite(n) && n >= 1 && n <= 5;

const normalizeStoredLevel = (
  storedLevel?: number | null,
): OccupationalRiskLevel | null => {
  if (storedLevel == null || !Number.isFinite(storedLevel)) return null;
  const rounded = Math.round(storedLevel);
  if (rounded >= 1 && rounded <= 5) return rounded as OccupationalRiskLevel;
  return null;
};

/** Nível 1–5 da matriz; null = não informado / inválido. */
export function resolveOccupationalRiskLevel(
  severity?: number,
  probability?: number,
  storedLevel?: number | null,
): OccupationalRiskLevel | null {
  const fromStored = normalizeStoredLevel(storedLevel);
  if (fromStored != null) return fromStored;

  if (!isValidMatrixValue(severity) || !isValidMatrixValue(probability)) {
    return null;
  }

  const matriz = getMatrizRisk(severity, probability);
  if (!matriz || matriz.level === 0) return null;
  if (matriz.level >= 5) return 5;

  return matriz.level as OccupationalRiskLevel;
}

export function entityMatchesMassAddFilter(
  level: OccupationalRiskLevel | null,
  filter: MassAddOccupationalRiskFilter,
): boolean {
  if (filter === 'all') return true;
  if (level == null) return false;
  if (filter === 'moderateAndAbove') return level >= 3;
  if (filter === 'highAndAbove') return level >= 4;
  return false;
}

export function getMassRemoveTargetLabel(
  target: MassRemoveOccupationalRiskTarget,
): string {
  if (target === 'all') return 'todos os vínculos';
  return `vínculos com Risco Ocupacional ${OCCUPATIONAL_RISK_LEVEL_NAMES[target]}`;
}
