'use strict';
const path = require('node:path'),
  assert = require('node:assert/strict'),
  { test } = require('node:test');
const ts = require('typescript'),
  fs = require('node:fs');
require.extensions['.ts'] = (module, filename) =>
  module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText,
    filename,
  );

const {
  IllustrationFlow,
  sessionKey,
  readPending,
} = require('../../src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/illustrations.flow');
const {
  createIllustrationApi,
  IllustrationError,
} = require('../../src/components/organisms/modals/ModalAddCharacterization/components/Illustrations/illustrations.api');
const { randomUUID } = require('node:crypto');
const scope = {
  userId: 1,
  companyId: 'company',
  workspaceId: 'workspace',
  characterizationId: 'element',
};
function storage() {
  const m = new Map();
  return {
    m,
    getItem: (k) => m.get(k) || null,
    setItem: (k, v) => m.set(k, v),
    removeItem: (k) => m.delete(k),
  };
}
function fixture() {
  const s = storage(),
    calls = [];
  const g = {
    generationId: randomUUID(),
    status: 'READY',
    expiresAt: new Date(Date.now() + 60000).toISOString(),
    caption: 'marked',
  };
  const api = {
    generate: async (...args) => {
      calls.push(['generate', ...args]);
      return g;
    },
    status: async (...args) => {
      calls.push(['status', ...args]);
      return g;
    },
    approve: async () => ({ id: randomUUID() }),
    discard: async () => ({ ...g, status: 'DISCARDED' }),
  };
  return { s, calls, g, api, flow: new IllustrationFlow(api, scope, s) };
}
test('dirty editor prevents any generation or session creation', async () => {
  const t = fixture();
  await t.flow.generate(true);
  assert.equal(t.calls.length, 0);
  assert.equal(t.s.m.size, 0);
  assert.match(t.flow.snapshot().error, /Salve/);
});
test('timeout is never retried automatically; recovery reuses the original UUID', async () => {
  const t = fixture();
  let first = true;
  t.api.generate = async (s, k) => {
    t.calls.push(['generate', s, k]);
    if (first) {
      first = false;
      throw Error('timeout');
    }
    return t.g;
  };
  await t.flow.generate(false);
  const pending = t.flow.snapshot().pending;
  assert.ok(pending.key);
  assert.equal(t.calls.length, 1);
  await t.flow.generate(false);
  assert.equal(t.calls.length, 1);
  await t.flow.recover();
  assert.equal(t.calls[1][2], pending.key);
});
test('reopening performs no POST; known ID recovery uses GET status', async () => {
  const t = fixture();
  await t.flow.generate(false);
  const next = new IllustrationFlow(t.api, scope, t.s);
  assert.equal(t.calls.length, 1);
  await next.recover();
  assert.equal(t.calls[1][0], 'status');
  assert.equal(t.calls[1][2], t.g.generationId);
});
test('session stores only UUIDs and isolates requester/company/workspace/element', async () => {
  const t = fixture();
  await t.flow.generate(false);
  assert.deepEqual(
    Object.keys(JSON.parse(t.s.getItem(sessionKey(scope)))).sort(),
    ['generationId', 'key'],
  );
  for (const other of [
    { ...scope, userId: 2 },
    { ...scope, companyId: 'other' },
    { ...scope, workspaceId: 'other' },
    { ...scope, characterizationId: 'other' },
  ])
    assert.equal(readPending(t.s, other), null);
});
test('corrupt session and unavailable storage do not break generation', async () => {
  const t = fixture();
  t.s.setItem(sessionKey(scope), 'bad');
  assert.equal(readPending(t.s, scope), null);
  const bad = {
    getItem() {
      throw Error();
    },
    setItem() {
      throw Error();
    },
    removeItem() {
      throw Error();
    },
  };
  const f = new IllustrationFlow(t.api, scope, bad);
  await f.generate(false);
  assert.equal(f.snapshot().generation.status, 'READY');
});
test('generation rejection 429 clears only the unaccepted pending request', async () => {
  const t = fixture();
  t.api.generate = async () => {
    throw new IllustrationError(429, 'Orçamento atingido');
  };
  await t.flow.generate(false);
  assert.equal(t.flow.snapshot().pending, null);
  assert.match(t.flow.snapshot().error, /Orçamento/);
});
test('503 carries generation ID and recovers UNKNOWN without new POST', async () => {
  const t = fixture();
  t.api.generate = async () => {
    throw new IllustrationError(503, 'Falha', t.g.generationId);
  };
  t.api.status = async () => ({ ...t.g, status: 'UNKNOWN' });
  await t.flow.generate(false);
  await t.flow.recover();
  assert.equal(t.flow.snapshot().generation.status, 'UNKNOWN');
  assert.ok(t.flow.snapshot().pending);
});
test('approval cleans tracking; approval failure retains recoverable attempt', async () => {
  const t = fixture();
  await t.flow.generate(false);
  t.api.approve = async () => {
    throw new IllustrationError(503, 'Consultar status');
  };
  assert.equal(await t.flow.approve(), false);
  assert.ok(t.flow.snapshot().pending);
  t.api.approve = async () => ({ id: 'approved' });
  assert.equal(await t.flow.approve(), true);
  assert.equal(t.flow.snapshot().pending, null);
  assert.equal(t.s.m.size, 0);
});
test('regenerate discards before creating a fresh UUID and obeys dirty guard', async () => {
  const t = fixture();
  await t.flow.generate(false);
  const old = t.flow.snapshot().pending.key;
  await t.flow.regenerate(true);
  assert.equal(t.calls.length, 1);
  await t.flow.regenerate(false);
  assert.equal(t.calls.length, 2);
  assert.notEqual(t.flow.snapshot().pending.key, old);
});
test('expired preview recovery clears tracking and allows an explicit new attempt', async () => {
  const t = fixture();
  await t.flow.generate(false);
  t.api.status = async () => ({ ...t.g, status: 'EXPIRED' });
  await t.flow.recover();
  assert.equal(t.flow.snapshot().pending, null);
});
test('transport sends no prompt/model, uses separate paths and authenticated blobs', async () => {
  const calls = [];
  const http = {
    post: async (...a) => {
      calls.push(['post', ...a]);
      return { data: {} };
    },
    get: async (...a) => {
      calls.push(['get', ...a]);
      return { data: [] };
    },
    delete: async (...a) => {
      calls.push(['delete', ...a]);
      return { data: {} };
    },
  };
  const api = createIllustrationApi(http);
  const key = randomUUID();
  await api.generate(scope, key);
  assert.equal(calls[0][2], undefined);
  assert.equal(calls[0][3].headers['Idempotency-Key'], key);
  await api.preview(scope, 'id');
  assert.equal(calls[1][2].responseType, 'blob');
  assert.ok(calls[1][1].includes('/illustrations/generations/id/preview'));
  await api.list(scope);
  assert.ok(!calls.some((c) => c[1].includes('/photo')));
});
test('regeneration never approves the previous image and approval uses only the displayed attempt', async () => {
  const t = fixture(),
    order = [];
  const first = t.g.generationId,
    second = randomUUID();
  t.api.discard = async (s, id) => {
    order.push(['discard', id]);
    return { ...t.g, status: 'DISCARDED' };
  };
  t.api.approve = async (s, id) => {
    order.push(['approve', id]);
    return { id: 'approved' };
  };
  await t.flow.generate(false);
  t.api.generate = async () => {
    order.push(['generate', second]);
    return { ...t.g, generationId: second };
  };
  await t.flow.regenerate(false);
  assert.deepEqual(order, [
    ['discard', first],
    ['generate', second],
  ]);
  assert.equal(t.flow.snapshot().generation.generationId, second);
  await t.flow.approve();
  assert.deepEqual(order[2], ['approve', second]);
});
test('failed discard prevents a new generation', async () => {
  const t = fixture();
  await t.flow.generate(false);
  t.api.discard = async () => {
    throw Error('failure');
  };
  await t.flow.regenerate(false);
  assert.equal(t.calls.length, 1);
  assert.equal(t.flow.snapshot().generation.generationId, t.g.generationId);
});
