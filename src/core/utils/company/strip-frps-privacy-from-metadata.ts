/** Chave exclusiva do endpoint PATCH /frps-privacy — nunca enviar no update genérico. */
export const FRPS_PRIVACY_METADATA_KEY = 'frpsPrivacy';

/**
 * Remove `frpsPrivacy` do metadata enviado no update genérico da empresa.
 * A política só muda pelo endpoint dedicado; o backend é a autoridade final.
 */
export function stripFrpsPrivacyFromCompanyMetadata<T extends Record<string, unknown>>(
  metadata: T | null | undefined,
): Omit<T, 'frpsPrivacy'> | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return undefined;
  }

  const clone = { ...metadata } as Record<string, unknown>;
  delete clone[FRPS_PRIVACY_METADATA_KEY];
  return clone as Omit<T, 'frpsPrivacy'>;
}

export function stripFrpsPrivacyFromCompanyPayload<T extends { metadata?: unknown }>(
  payload: T,
): T {
  if (!payload?.metadata || typeof payload.metadata !== 'object') {
    return payload;
  }

  return {
    ...payload,
    metadata: stripFrpsPrivacyFromCompanyMetadata(
      payload.metadata as Record<string, unknown>,
    ),
  };
}
