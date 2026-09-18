import { extractApiError } from '@v2/utils/extract-api-error';
import { IErrorResp } from '@v2/types/error.type';

import type {
  RiskMatrixApiErrorBody,
  RiskMatrixBindingConflict,
} from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { RISK_MATRIX_COVERAGE_LABELS } from '../maps/risk-matrix.maps';

export const RISK_MATRIX_AVAILABILITY_CONFLICT_FALLBACK =
  'Não foi possível disponibilizar esta matriz. Outra matriz já ocupa uma das coberturas neste estabelecimento.';

export function getRiskMatrixApiErrorBody(
  error: unknown,
): RiskMatrixApiErrorBody | null {
  const data = (error as IErrorResp | undefined)?.response?.data;
  if (!data || typeof data !== 'object') return null;
  return data as RiskMatrixApiErrorBody;
}

export function getRiskMatrixApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const body = getRiskMatrixApiErrorBody(error);
  if (typeof body?.message === 'string' && body.message.trim()) {
    return body.message.trim();
  }

  if (error && typeof error === 'object') {
    const message = extractApiError(error as IErrorResp);
    if (message?.trim()) return message.trim();
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function formatRiskMatrixBindingConflicts(
  conflicts: RiskMatrixBindingConflict[] | undefined,
): string | null {
  if (!Array.isArray(conflicts) || conflicts.length === 0) return null;

  return conflicts
    .map((conflict) => {
      const coverage =
        RISK_MATRIX_COVERAGE_LABELS[conflict.coverageKey] ?? conflict.coverageKey;
      const occupier = conflict.existingMatrixName?.trim()
        ? `${conflict.existingMatrixName} v${conflict.existingVersionNumber}`
        : `v${conflict.existingVersionNumber}`;
      return `${coverage} ocupada por ${occupier}`;
    })
    .join('; ');
}

export function getRiskMatrixAvailabilityConflictMessage(
  error: unknown,
  fallback = RISK_MATRIX_AVAILABILITY_CONFLICT_FALLBACK,
): string {
  const body = getRiskMatrixApiErrorBody(error);
  const formatted = formatRiskMatrixBindingConflicts(body?.conflicts);
  if (formatted) {
    return `Não foi possível alterar a disponibilidade. ${formatted}.`;
  }

  return getRiskMatrixApiErrorMessage(error, fallback);
}
