import { IErrorResp } from '@v2/types/error.type';
import { extractStringValues } from './extract-string-values';

export const extractApiError = (error: IErrorResp) => {
  const message = error.response?.data?.message;

  if (
    !message &&
    error.response?.data &&
    typeof error.response?.data === 'object'
  ) {
    return extractStringValues(error.response?.data).join(', ');
  }

  return message;
};
