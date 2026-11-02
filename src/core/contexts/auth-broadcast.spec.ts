import assert from 'node:assert/strict';
import { test } from 'node:test';

import { subscribeAuthLogout } from './auth-broadcast.ts';

class ChannelFixture extends EventTarget {
  closeCount = 0;
  posts: unknown[] = [];
  closed = false;
  postMessage(value: unknown) {
    assert.equal(this.closed, false);
    this.posts.push(value);
  }
  close() {
    this.closeCount++;
    this.closed = true;
  }
  receive(data: unknown) {
    this.dispatchEvent(new MessageEvent('message', { data }));
  }
}

test('a remote logout clears local state even when the shared token cookie was already removed, without echoing', () => {
  const channel = new ChannelFixture();
  let token: string | undefined = 'shared-cookie';
  let user: { id: number } | null = { id: 7 };
  let legacyQueries = 3,
    v2Queries = 4,
    editContext = true;
  const options: unknown[] = [];
  const cleanup = subscribeAuthLogout(channel, (received) => {
    options.push(received);
    user = null;
    legacyQueries = 0;
    v2Queries = 0;
    editContext = false;
    if (received.broadcast !== false) channel.postMessage('signOut');
  });
  // The sender removes cookies before its BroadcastChannel event reaches us.
  token = undefined;
  channel.receive('signOut');
  assert.equal(token, undefined);
  assert.equal(user, null);
  assert.equal(legacyQueries, 0);
  assert.equal(v2Queries, 0);
  assert.equal(editContext, false);
  assert.deepEqual(options, [{ broadcast: false }]);
  assert.deepEqual(channel.posts, []);
  cleanup();
});

test('unrelated and malformed channel messages do not log out or create an echo', () => {
  const channel = new ChannelFixture();
  let calls = 0;
  const cleanup = subscribeAuthLogout(channel, () => {
    calls++;
  });
  for (const message of ['signIn', '', null, undefined, { type: 'signOut' }, 1])
    channel.receive(message);
  assert.equal(calls, 0);
  assert.deepEqual(channel.posts, []);
  cleanup();
});

test('cleanup closes its channel exactly once and late events no longer affect local auth', () => {
  const channel = new ChannelFixture();
  let calls = 0;
  const cleanup = subscribeAuthLogout(channel, () => {
    calls++;
  });
  channel.receive('signOut');
  assert.equal(calls, 1);
  cleanup();
  cleanup();
  assert.equal(channel.closeCount, 1);
  channel.receive('signOut');
  assert.equal(calls, 1);
});

test('remount uses only the new channel and does not retain the old provider listener', () => {
  const previous = new ChannelFixture(),
    next = new ChannelFixture();
  let oldCalls = 0,
    newCalls = 0;
  const unmount = subscribeAuthLogout(previous, () => {
    oldCalls++;
  });
  unmount();
  const cleanup = subscribeAuthLogout(next, (options) => {
    assert.equal(options.broadcast, false);
    newCalls++;
  });
  previous.receive('signOut');
  next.receive('signOut');
  assert.equal(oldCalls, 0);
  assert.equal(newCalls, 1);
  assert.equal(previous.closeCount, 1);
  cleanup();
  assert.equal(next.closeCount, 1);
});

test('the no-broadcast instruction is preserved for asynchronous local logout', async () => {
  const channel = new ChannelFixture();
  let calls = 0;
  const cleanup = subscribeAuthLogout(channel, async (options) => {
    await Promise.resolve();
    assert.deepEqual(options, { broadcast: false });
    calls++;
  });
  channel.receive('signOut');
  await Promise.resolve();
  assert.equal(calls, 1);
  assert.deepEqual(channel.posts, []);
  cleanup();
});
