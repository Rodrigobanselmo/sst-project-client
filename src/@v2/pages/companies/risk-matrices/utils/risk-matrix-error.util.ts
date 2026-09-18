import { extractApiError } from '@v2/utils/extract-api-error';
import { IErrorResp } from '@v2/types/error.type';

import type { RiskMatrixApiErrorBody } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

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
