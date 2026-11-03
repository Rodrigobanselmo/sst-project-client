import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createAuthSessionLifecycle } from './auth-session-lifecycle.ts';

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

test('ending a session invalidates a captured request synchronously and keeps the ended generation inspectable', () => {
  const session = createAuthSessionLifecycle();
  const request = session.capture();
  assert.equal(session.isCurrent(request), true);
  session.end();
  assert.equal(session.isCurrent(request), false);
  assert.equal(session.isGeneration(request), false);
  assert.equal(session.isEnded(), true);
  assert.equal(session.isGeneration(session.capture()), true);
  assert.equal(session.isCurrent(session.capture()), false);
});

test('repeated end calls do not advance ownership or revive requests', () => {
  const session = createAuthSessionLifecycle();
  session.end();
  const ended = session.capture();
  session.end();
  session.end();
  assert.equal(session.capture(), ended);
  assert.equal(session.isGeneration(ended), true);
  assert.equal(session.isCurrent(ended), false);
});

test('an explicit begin invalidates every previous capture and makes only its new generation current', () => {
  const session = createAuthSessionLifecycle();
  const old = session.capture();
  session.end();
  const ended = session.capture();
  const active = session.begin();
  assert.equal(session.capture(), active);
  assert.equal(session.isEnded(), false);
  assert.equal(session.isCurrent(active), true);
  assert.equal(session.isGeneration(old), false);
  assert.equal(session.isGeneration(ended), false);
  assert.equal(session.isCurrent(old), false);
  assert.equal(session.isCurrent(ended), false);
});

test('a late getMe response cannot restore a user after logout', async () => {
  const session = createAuthSessionLifecycle();
  const response = deferred<{ id: number }>();
  const request = session.capture();
  let user: { id: number } | null = { id: 7 };
  const read = response.promise.then((value) => {
    if (session.isCurrent(request)) user = value;
  });
  await session.logout(() => {
    user = null;
  });
  response.resolve({ id: 7 });
  await read;
  assert.equal(user, null);
  assert.equal(session.isEnded(), true);
});

test('a late profile response from an older login cannot replace a newer explicit login', async () => {
  const session = createAuthSessionLifecycle();
  const response = deferred<{ id: number }>();
  const olderRequest = session.capture();
  let user = { id: 7 };
  const read = response.promise.then((value) => {
    if (session.isCurrent(olderRequest)) user = value;
  });
  session.begin();
  const newRequest = session.capture();
  user = { id: 8 };
  response.resolve({ id: 7 });
  await read;
  assert.deepEqual(user, { id: 8 });
  assert.equal(session.isCurrent(newRequest), true);
});

test('late refresh success cannot write tokens after logout or overwrite a later login', async () => {
  for (const loginAgain of [false, true]) {
    const session = createAuthSessionLifecycle();
    const response = deferred<string>();
    const request = session.capture();
    const cookies: string[] = [];
    const refresh = response.promise.then((token) => {
      if (session.isCurrent(request)) cookies.push(token);
    });
    await session.logout(() => undefined);
    if (loginAgain) {
      session.begin();
      cookies.push('new-explicit-session');
    }
    response.resolve('old-refresh-token');
    await refresh;
    assert.deepEqual(cookies, loginAgain ? ['new-explicit-session'] : []);
    assert.equal(session.isEnded(), !loginAgain);
  }
});

test('logout ends synchronously before invoking cleanup and passes the cleanup generation', async () => {
  const session = createAuthSessionLifecycle();
  const oldRequest = session.capture();
  const cleanup = deferred<void>();
  let called = 0;
  const completion = session.logout((owner) => {
    called++;
    assert.equal(session.isEnded(), true);
    assert.equal(session.isCurrent(oldRequest), false);
    assert.equal(session.isGeneration(owner), true);
    assert.equal(owner, session.capture());
    return cleanup.promise;
  });
  assert.equal(called, 1);
  assert.equal(session.isEnded(), true);
  cleanup.resolve();
  await completion;
});

test('concurrent and completed duplicate logouts keep one promise and one effect until begin', async () => {
  const session = createAuthSessionLifecycle();
  const cleanup = deferred<void>();
  let effects = 0;
  const first = session.logout(() => {
    effects++;
    return cleanup.promise;
  });
  const duplicate = session.logout(() => {
    effects++;
  });
  assert.equal(duplicate, first);
  assert.equal(effects, 1);
  cleanup.resolve();
  await first;
  const settledDuplicate = session.logout(() => {
    effects++;
  });
  assert.equal(settledDuplicate, first);
  await settledDuplicate;
  assert.equal(effects, 1);
});

test('a reentrant logout during synchronous cleanup shares the existing barrier', async () => {
  const session = createAuthSessionLifecycle();
  let nested: Promise<void> | undefined;
  let effects = 0;
  const first = session.logout(() => {
    effects++;
    nested = session.logout(() => {
      effects++;
    });
  });
  assert.equal(nested, first);
  await first;
  assert.equal(effects, 1);
});

test('begin permits a new logout while an older cleanup cannot erase the new session or barrier', async () => {
  const session = createAuthSessionLifecycle();
  const oldCleanup = deferred<void>();
  const newCleanup = deferred<void>();
  let user: { id: number } | null = { id: 7 };
  let oldClears = 0;
  const oldLogout = session.logout(async (owner) => {
    await oldCleanup.promise;
    if (session.isGeneration(owner)) {
      oldClears++;
      user = null;
    }
  });
  session.begin();
  user = { id: 8 };
  const newRequest = session.capture();
  oldCleanup.resolve();
  await oldLogout;
  assert.equal(oldClears, 0);
  assert.deepEqual(user, { id: 8 });
  assert.equal(session.isCurrent(newRequest), true);
  let newEffects = 0;
  const newLogout = session.logout(() => {
    newEffects++;
    user = null;
    return newCleanup.promise;
  });
  assert.notEqual(newLogout, oldLogout);
  assert.equal(
    session.logout(() => assert.fail('duplicate new cleanup')),
    newLogout,
  );
  assert.equal(newEffects, 1);
  assert.equal(user, null);
  newCleanup.resolve();
  await newLogout;
});

test('an older pending cleanup cannot replace a newer pending logout promise', async () => {
  const session = createAuthSessionLifecycle();
  const previous = deferred<void>();
  const current = deferred<void>();
  const first = session.logout(() => previous.promise);
  session.begin();
  const second = session.logout(() => current.promise);
  previous.resolve();
  await first;
  assert.equal(
    session.logout(() =>
      assert.fail('old completion cleared the newer barrier'),
    ),
    second,
  );
  current.resolve();
  await second;
});

test('synchronous cleanup failures reject honestly without reviving or repeating logout', async () => {
  const session = createAuthSessionLifecycle();
  const error = new Error('synthetic synchronous cleanup failure');
  let effects = 0;
  const failed = session.logout(() => {
    effects++;
    throw error;
  });
  await assert.rejects(failed, (actual) => actual === error);
  assert.equal(session.isEnded(), true);
  const duplicate = session.logout(() => {
    effects++;
  });
  assert.equal(duplicate, failed);
  await assert.rejects(duplicate, (actual) => actual === error);
  assert.equal(effects, 1);
  session.begin();
  await session.logout(() => {
    effects++;
  });
  assert.equal(effects, 2);
});

test('asynchronous cleanup failures remain observable and never invalidate a newer active login', async () => {
  const session = createAuthSessionLifecycle();
  const cleanup = deferred<void>();
  const error = new Error('synthetic asynchronous cleanup failure');
  const failed = session.logout(() => cleanup.promise);
  const rejected = assert.rejects(failed, (actual) => actual === error);
  session.begin();
  const newRequest = session.capture();
  cleanup.reject(error);
  await rejected;
  assert.equal(session.isCurrent(newRequest), true);
  assert.equal(session.isEnded(), false);
});

test('independent lifecycle instances do not share login, logout or cleanup ownership', async () => {
  const first = createAuthSessionLifecycle();
  const second = createAuthSessionLifecycle();
  const firstRequest = first.capture();
  const secondRequest = second.capture();
  let firstEffects = 0;
  let secondEffects = 0;
  await first.logout(() => {
    firstEffects++;
  });
  assert.equal(first.isCurrent(firstRequest), false);
  assert.equal(second.isCurrent(secondRequest), true);
  assert.equal(second.isEnded(), false);
  await second.logout(() => {
    secondEffects++;
  });
  first.begin();
  assert.equal(first.isEnded(), false);
  assert.equal(second.isEnded(), true);
  assert.equal(firstEffects, 1);
  assert.equal(secondEffects, 1);
});
