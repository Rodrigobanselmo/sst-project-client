import { IErrorResp } from '@v2/types/error.type';
import { extractStringValues } from './extract-string-values';

export const extractApiError = (error: IErrorResp) => {
  const raw = error.response?.data?.message;
  const message = Array.isArray(raw) ? raw.join(' ') : raw;

  if (
    !message &&
    error.response?.data &&
    typeof error.response?.data === 'object'
  ) {
    return extractStringValues(error.response?.data).join(', ');
  }

  return message;
};
