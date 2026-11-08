type Tokens = { token: string; refreshToken: string };
type Scope = { sub?: string | number; companyId?: string; exp?: number };

function canReuseToken(scope: Scope | undefined, companyId?: string) {
  return (
    !!scope &&
    scope.companyId === companyId &&
    (scope.exp === undefined || scope.exp * 1000 > Date.now())
  );
}

export class SessionRefreshRejected extends Error {
  constructor() {
    super('A renovação da sessão foi recusada.');
  }
}

export class SessionRefreshSuperseded extends Error {
  constructor() {
    super('A sessão mudou durante a renovação.');
  }
}

export function createAuthRefreshCoordinator(deps: {
  read: () => Partial<Tokens>;
  write: (tokens: Tokens) => void;
  scope: (token: string) => Scope | undefined;
  renew: (refreshToken: string, companyId?: string) => Promise<Tokens>;
  lock?: (task: () => Promise<string>) => Promise<string>;
  isRejected: (error: unknown) => boolean;
}) {
  let tail = Promise.resolve();
  return function refresh(input: {
    accessToken?: string;
    companyId?: string;
    isCurrent: () => boolean;
  }): Promise<string> {
    const initial = deps.read();
    const expected = input.accessToken || initial.token;
    const expectedScope = expected && deps.scope(expected);
    const companyId =
      input.companyId || (expectedScope || undefined)?.companyId;

    const run = async () => {
      if (!input.isCurrent()) throw new SessionRefreshSuperseded();
      const current = deps.read();
      if (!current.token || !current.refreshToken)
        throw new SessionRefreshRejected();
      const scope = deps.scope(current.token);
      if (expectedScope && expectedScope.sub !== scope?.sub)
        throw new SessionRefreshSuperseded();

      // A request waiting for the lock can use the result already committed by another tab.
      if (current.token !== expected) {
        if (canReuseToken(scope, companyId)) return current.token;
        if (!input.companyId && scope?.companyId !== companyId)
          throw new SessionRefreshSuperseded();
      }

      let updated: Tokens;
      try {
        updated = await deps.renew(current.refreshToken, companyId);
      } catch (error) {
        if (!input.isCurrent()) throw new SessionRefreshSuperseded();
        const latest = deps.read();
        if (
          latest.refreshToken !== current.refreshToken ||
          latest.token !== current.token
        ) {
          const latestScope = latest.token && deps.scope(latest.token);
          if (
            latest.token &&
            latest.refreshToken &&
            scope &&
            latestScope &&
            latestScope.sub === scope.sub &&
            canReuseToken(latestScope, companyId)
          )
            return latest.token;
          throw new SessionRefreshSuperseded();
        }
        if (deps.isRejected(error)) throw new SessionRefreshRejected();
        throw error;
      }

      const latest = deps.read();
      if (
        !input.isCurrent() ||
        latest.refreshToken !== current.refreshToken ||
        latest.token !== current.token
      )
        throw new SessionRefreshSuperseded();
      deps.write(updated);
      return updated.token;
    };

    // Serialize in the tab as well, including browsers without Web Locks.
    const result = tail.then(() => (deps.lock ? deps.lock(run) : run()));
    tail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
}
