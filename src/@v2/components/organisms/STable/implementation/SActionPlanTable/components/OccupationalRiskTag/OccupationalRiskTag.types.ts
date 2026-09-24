import { IRiskLevelValues } from '@v2/models/security/types/risk-level-values.type';

export interface OccupationalRiskTagProps {
  /** Ponte numérica 1..6 — prioridade/prazo/filtros; fallback visual SYSTEM/legado. */
  level: IRiskLevelValues;
  matrixSource?: string | null;
  matrixVersionId?: string | null;
  matrixEvaluatedAt?: string | Date | null;
  resolvedLabel?: string | null;
  resolvedColor?: string | null;
  classificationPresentationColor?: string | null;
  size?: 'md';
}
