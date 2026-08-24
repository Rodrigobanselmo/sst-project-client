export function serializeDocumentModelData(data: unknown): string {
  return JSON.stringify(data);
}

export function freezeDocumentModelSaveSnapshot<T>(data: T): T {
  return Object.freeze(JSON.parse(JSON.stringify(data)));
}

function toSha256Hex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashDocumentModelData(data: unknown): Promise<string> {
  const serialized = serializeDocumentModelData(data);

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(serialized),
    );
    return toSha256Hex(digest);
  }

  const { createHash } = await import('crypto');
  return createHash('sha256').update(serialized, 'utf8').digest('hex');
}

export function hashDocumentModelDataSync(data: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createHash } = require('crypto') as typeof import('crypto');
  return createHash('sha256')
    .update(serializeDocumentModelData(data), 'utf8')
    .digest('hex');
}
