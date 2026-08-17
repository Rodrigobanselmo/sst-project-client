import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';

export function normalizePublicFormEncrypt(
  encrypt?: string | string[] | null,
): string | undefined {
  const token = Array.isArray(encrypt) ? encrypt[0] : encrypt;
  if (!token || token.length === 0) {
    return undefined;
  }
  return token;
}

export function getPublicFormApplicationQueryKey(
  applicationId: string | undefined,
  encrypt?: string | string[] | null,
) {
  const participantKey = normalizePublicFormEncrypt(encrypt) ?? 'anonymous';
  return [
    QueryKeyFormEnum.PUBLIC_FORM_APPLICATION,
    applicationId,
    participantKey,
  ];
}
