import { extractApiError } from '@v2/utils/extract-api-error';
import { IErrorResp } from '@v2/types/error.type';

export function getHoMethodApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const message = extractApiError(error as IErrorResp);
  if (message?.trim()) return message.trim();
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
