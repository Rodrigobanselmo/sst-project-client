// Validate persisted strings only; never convert the chosen business day to an
// instant or use this parsed value for display/submission.
const validCivilDay = (value: unknown): value is string => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.getUTCFullYear() === Number(value.slice(0, 4)) &&
    parsed.getUTCMonth() + 1 === Number(value.slice(5, 7)) &&
    parsed.getUTCDate() === Number(value.slice(8, 10))
  );
};

export type SstEditContext = {
  version: 1;
  effectiveFrom: string;
  confirmedOn: string;
};
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;
const uuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const key = (userId: number | undefined, companyId: string | undefined) =>
  Number.isSafeInteger(userId) && userId! > 0 && uuid(companyId)
    ? `sst-new-condition-suggestion-v1:${userId}:${companyId}`
    : undefined;

export function localCivilToday(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function sstEditSuggestion(
  context: SstEditContext | undefined,
  today = localCivilToday(),
) {
  return {
    effectiveFrom: context?.effectiveFrom || today,
    needsRenewal: !!context && context.confirmedOn !== today,
  };
}

/** A convenience only: no head, operation, reason or correction consent is stored. */
export function readSstEditContext(
  storage: Storage | undefined,
  userId: number | undefined,
  companyId: string | undefined,
): SstEditContext | undefined {
  const id = key(userId, companyId);
  if (!storage || !id) return;
  try {
    const parsed = JSON.parse(storage.getItem(id) || 'null');
    if (
      parsed?.version === 1 &&
      validCivilDay(parsed.effectiveFrom) &&
      validCivilDay(parsed.confirmedOn)
    )
      return {
        version: 1,
        effectiveFrom: parsed.effectiveFrom,
        confirmedOn: parsed.confirmedOn,
      };
  } catch {
    /* Restricted browser storage never blocks saving an actual condition. */
  }
}
export function saveSstEditContext(
  storage: Storage | undefined,
  userId: number | undefined,
  companyId: string | undefined,
  effectiveFrom: string,
  confirmedOn = localCivilToday(),
) {
  const id = key(userId, companyId);
  if (
    !storage ||
    !id ||
    !validCivilDay(effectiveFrom) ||
    !validCivilDay(confirmedOn)
  )
    return;
  try {
    storage.setItem(
      id,
      JSON.stringify({
        version: 1,
        effectiveFrom,
        confirmedOn,
      } satisfies SstEditContext),
    );
  } catch {
    /* Convenience persistence must not undo a server-authorized mutation. */
  }
}
export function clearSstEditContext(
  storage: Storage | undefined,
  userId: number | undefined,
  companyId: string | undefined,
) {
  const id = key(userId, companyId);
  if (storage && id)
    try {
      storage.removeItem(id);
    } catch {
      /* No domain change. */
    }
}
export function browserEditStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/** Do not substitute the consultancy's JWT company for the target being edited. */
export function sstDecisionCompanyId(
  serverCompanyId: unknown,
  request: { url?: string; params?: any; data?: any },
): string | undefined {
  if (uuid(serverCompanyId)) return serverCompanyId;
  let body = request.data;
  if (typeof body === 'string')
    try {
      body = JSON.parse(body);
    } catch {
      body = undefined;
    }
  const bodyCompany =
    typeof body?.get === 'function' ? body.get('companyId') : body?.companyId;
  const pathCompany = request.url?.match(
    /(?:^|\/)companies\/([0-9a-f-]{36})(?:\/|$)/i,
  )?.[1];
  const values = [bodyCompany, request.params?.companyId, pathCompany].filter(
    uuid,
  );
  const ids = [...new Set(values)];
  return ids.length === 1 ? ids[0] : undefined;
}
