import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createAuthRefreshCoordinator,
  SessionRefreshRejected,
  SessionRefreshSuperseded,
} from './auth-refresh-coordinator.ts';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function fixture() {
  let tokens = { token: 'user:company:old', refreshToken: 'old' };
  let renewals = 0;
  let tail = Promise.resolve();
  const deps = {
    read: () => tokens,
    write: (updated: typeof tokens) => {
      tokens = updated;
    },
    scope: (token: string) => {
      const [sub, companyId] = token.split(':');
      return { sub, companyId };
    },
    renew: async (refresh: string, company = 'company') => {
      assert.equal(refresh, tokens.refreshToken);
      renewals++;
      return {
        token: `user:${company}:${renewals}`,
        refreshToken: String(renewals),
      };
    },
    lock(task: () => Promise<string>) {
      const result = tail.then(task);
      tail = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    },
    isRejected: (error: unknown) =>
      error instanceof Error && error.message === '401',
  };
  return { deps, count: () => renewals };
}

const current = () => true;

test('two tabs with the same expired token renew once and keep the company', async () => {
  const { deps, count } = fixture();
  const firstTab = createAuthRefreshCoordinator(deps);
  const secondTab = createAuthRefreshCoordinator(deps);

  assert.deepEqual(
    await Promise.all([
      firstTab({ isCurrent: current }),
      secondTab({ isCurrent: current }),
    ]),
    ['user:company:1', 'user:company:1'],
  );
  assert.equal(count(), 1);
});

test('an explicit company switch uses the latest refresh token after a concurrent renewal', async () => {
  const { deps, count } = fixture();
  const refresh = createAuthRefreshCoordinator(deps);
  const first = refresh({ isCurrent: current });
  const switched = refresh({ companyId: 'other', isCurrent: current });

  assert.equal(await first, 'user:company:1');
  assert.equal(await switched, 'user:other:2');
  assert.equal(count(), 2);
});

test('transient errors preserve cookies and allow the next attempt; a 401 signals invalid session', async () => {
  const { deps } = fixture();
  const networkError = new Error('offline');
  let failure: Error | undefined = networkError;
  const refresh = createAuthRefreshCoordinator({
    ...deps,
    renew: (token, company) => {
      if (failure) throw failure;
      return deps.renew(token, company);
    },
  });

  await assert.rejects(
    refresh({ isCurrent: current }),
    (error) => error === networkError,
  );
  assert.equal(deps.read().refreshToken, 'old');

  failure = undefined;
  assert.equal(await refresh({ isCurrent: current }), 'user:company:1');

  failure = new Error('401');
  await assert.rejects(refresh({ isCurrent: current }), SessionRefreshRejected);
});

test('logout during renewal never restores the session', async () => {
  const { deps } = fixture();
  const started = deferred();
  const finish = deferred();
  let active = true;
  const refresh = createAuthRefreshCoordinator({
    ...deps,
    renew: async (token, company) => {
      started.resolve();
      await finish.promise;
      return deps.renew(token, company);
    },
  });

  const attempt = refresh({ isCurrent: () => active });
  await started.promise;
  active = false;
  finish.resolve();
  await assert.rejects(attempt, SessionRefreshSuperseded);
  assert.equal(deps.read().refreshToken, 'old');
});

test('a stale request cannot replay with a different user after another tab signs in', async () => {
  const { deps, count } = fixture();
  deps.write({
    token: 'other-user:company:new',
    refreshToken: 'other-refresh',
  });
  const refresh = createAuthRefreshCoordinator(deps);
  await assert.rejects(
    refresh({ accessToken: 'user:company:old', isCurrent: current }),
    SessionRefreshSuperseded,
  );
  assert.equal(count(), 0);
});

test('a newer but expired token must be renewed before retrying a stale request', async () => {
  const { deps, count } = fixture();
  deps.write({ token: 'user:company:expired', refreshToken: 'latest' });
  const refresh = createAuthRefreshCoordinator({
    ...deps,
    scope: (token) => ({ ...deps.scope(token), exp: 1 }),
  });
  assert.equal(
    await refresh({ accessToken: 'user:company:old', isCurrent: current }),
    'user:company:1',
  );
  assert.equal(count(), 1);
});
