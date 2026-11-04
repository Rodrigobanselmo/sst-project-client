import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAiAccountingNotice,
  publishAiAccountingNotice,
  publishAiAccountingFailure,
} from './ai-accounting-notice.ts';

test('only the structured accounting contract becomes a global notice', () => {
  assert.equal(parseAiAccountingNotice({ message: 'quota or anything' }), null);
  assert.equal(
    parseAiAccountingNotice({ code: 'OTHER_ERROR', message: 'unrelated' }),
    null,
  );
  assert.equal(
    parseAiAccountingNotice({
      code: 'AI_DAILY_BUDGET_EXCEEDED',
      message: ['invalid'],
    }),
    null,
  );
  assert.equal(
    parseAiAccountingNotice({
      code: 'AI_DAILY_BUDGET_EXCEEDED',
      message: 'x'.repeat(1201),
    }),
    null,
  );
  const value = parseAiAccountingNotice({
    code: 'AI_DAILY_BUDGET_EXCEEDED',
    message: 'Limite diário da empresa atingido.',
    scope: 'COMPANY',
    resetAt: '2026-11-05T03:00:00Z',
    secret: 'must never be copied',
  });
  assert.deepEqual(value, {
    code: 'AI_DAILY_BUDGET_EXCEEDED',
    message: 'Limite diário da empresa atingido.',
    scope: 'COMPANY',
    resetAt: '2026-11-05T03:00:00Z',
  });
});
test('SSR parses structured failures without depending on window', () => {
  assert.equal(
    publishAiAccountingNotice({
      code: 'AI_PRICING_UNAVAILABLE',
      message: 'Tarifa precisa ser revisada.',
    }),
    true,
  );
  assert.equal(publishAiAccountingNotice(null), false);
});
test('download error JSON is recognized even when delivered as Blob or ArrayBuffer', async () => {
  const json = JSON.stringify({
    code: 'AI_DAILY_BUDGET_EXCEEDED',
    message: 'Limite diário atingido.',
  });
  assert.equal(
    await publishAiAccountingFailure(
      new Blob([json], { type: 'application/json' }),
    ),
    true,
  );
  assert.equal(
    await publishAiAccountingFailure(new TextEncoder().encode(json).buffer),
    true,
  );
  assert.equal(
    await publishAiAccountingFailure(new Blob(['a'.repeat(16001)])),
    false,
  );
});
