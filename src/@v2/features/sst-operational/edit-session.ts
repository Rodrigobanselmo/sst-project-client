// Explicit convenience in this tab only; never an authorization, saved head,
// AI approval or eSocial send. Nothing here is persisted across reloads.
export const SST_EDIT_SESSION_MS = 2 * 60 * 60 * 1000;
export type SstEditSession = Readonly<{
  userId: number;
  companyId: string;
  effectiveFrom: string;
  reason: string;
  startedAt: number;
  expiresAt: number;
  reviewNext: boolean;
}>;
const companyKey = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const civilDay = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const leap = y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0);
  return (
    y >= 1 &&
    m >= 1 &&
    m <= 12 &&
    d >= 1 &&
    d <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]
  );
};
export function createSstEditSessionStore(now = Date.now) {
  let userId: number | undefined, companyId: string | undefined;
  let active: SstEditSession | undefined;
  let expired = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  const matches = (user: number | undefined, company: string | undefined) => {
    const time = now();
    if (active && (time < active.startedAt || time >= active.expiresAt))
      expired = true;
    return (
      !expired &&
      !!active &&
      active.userId === user &&
      active.companyId === company &&
      userId === user &&
      companyId === company
    );
  };
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    snapshot: () => active,
    bindScope(user: number | undefined, company: string | undefined) {
      const nextUser =
        Number.isSafeInteger(user) && user! > 0 ? user : undefined;
      const nextCompany = companyKey(company) ? company : undefined;
      if (userId !== nextUser || companyId !== nextCompany) {
        userId = nextUser;
        companyId = nextCompany;
        active = undefined;
        expired = false;
        emit();
      }
    },
    activate(input: {
      userId: number;
      companyId: string;
      effectiveFrom: string;
      reason: string;
    }) {
      if (
        input.userId !== userId ||
        input.companyId !== companyId ||
        !userId ||
        !companyId ||
        !civilDay(input.effectiveFrom) ||
        !input.reason.trim() ||
        input.reason.trim().length > 2000
      )
        throw new Error(
          'Confira a empresa, a data e o motivo antes de ativar o contexto.',
        );
      const startedAt = now();
      expired = false;
      active = Object.freeze({
        userId: input.userId,
        companyId: input.companyId,
        effectiveFrom: input.effectiveFrom,
        reason: input.reason.trim(),
        startedAt,
        expiresAt: startedAt + SST_EDIT_SESSION_MS,
        reviewNext: false,
      });
      emit();
    },
    peek(user: number | undefined, company: string | undefined) {
      return matches(user, company) ? active : undefined;
    },
    reviewNext() {
      if (!active || !matches(userId, companyId)) return;
      active = Object.freeze({ ...active, reviewNext: true });
      emit();
    },
    resolve(
      user: number | undefined,
      company: string | undefined,
      expectedHead: unknown,
    ) {
      // Only the fresh challenge for THIS failed mutation can be reused.
      if (
        !matches(user, company) ||
        typeof expectedHead !== 'string' ||
        !/^[a-f0-9]{64}$/.test(expectedHead)
      )
        return;
      if (active!.reviewNext) {
        active = Object.freeze({ ...active!, reviewNext: false });
        emit();
        return;
      }
      return {
        intent: 'NEW_CONDITION' as const,
        effectiveFrom: active!.effectiveFrom,
        reason: active!.reason,
        expectedHead,
      };
    },
    clear() {
      active = undefined;
      expired = false;
      emit();
    },
  };
}
export const sstEditSession = createSstEditSessionStore();
