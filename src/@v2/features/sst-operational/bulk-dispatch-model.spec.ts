import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  bulkDispatchItems,
  bulkDispatchItemMessage,
  bulkDispatchRequestKey,
  bulkDispatchStateLabel,
  bulkDispatchProgress,
} from './bulk-dispatch-model.ts';

test('bulk dispatch identity includes company, environment and declared employer registration without an employee limit', () => {
  const input = {
    companyId: 'company-a',
    environment: 2 as const,
    employerRegistration: '11222333',
  };
  assert.equal(
    bulkDispatchRequestKey(input),
    bulkDispatchRequestKey({ ...input }),
  );
  for (const changed of [
    { ...input, companyId: 'company-b' },
    { ...input, environment: 1 as const },
    { ...input, employerRegistration: '11222333000181' },
  ])
    assert.notEqual(
      bulkDispatchRequestKey(input),
      bulkDispatchRequestKey(changed),
    );
  assert.deepEqual(JSON.parse(bulkDispatchRequestKey(input)), [
    'company-a',
    2,
    '11222333',
    'CURRENT',
    'SEND_PENDING',
  ]);
});

test('progress counts employees, never protocol or unknown results as concluded', () => {
  const counts = {
    total: 10_000,
    settled: 4000,
    pending: 3000,
    preparing: 0,
    queued: 1000,
    processing: 1000,
    accepted: 3000,
    rejected: 100,
    blocked: 100,
    noChanges: 700,
    cancelled: 100,
    unknown: 1000,
  };
  assert.equal(bulkDispatchProgress(counts), 40);
  assert.equal(bulkDispatchProgress({ ...counts, unknown: 2000 }), 40);
  assert.equal(bulkDispatchProgress({ ...counts, total: 0 }), 0);
  assert.equal(bulkDispatchProgress({ ...counts, settled: 20_000 }), 100);
});

test('paged bulk results update the same item without duplicating employees or receipts on refresh', () => {
  const rows = bulkDispatchItems([
    {
      items: [
        { id: 'a', employeeId: 1, state: 'PROCESSING' },
        { id: 'b', employeeId: 2, state: 'BLOCKED' },
      ],
    },
    {
      items: [
        { id: 'a', employeeId: 1, state: 'ACCEPTED', receipt: 'test-receipt' },
      ],
    },
  ]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].state, 'ACCEPTED');
  assert.equal(rows[0].receipt, 'test-receipt');
  assert.equal(rows[1].state, 'BLOCKED');
});

test('uncertain and in-progress bulk states never claim acceptance', () => {
  for (const state of [
    'QUEUED',
    'PROCESSING',
    'SENDING',
    'POLLING',
    'UNKNOWN',
    'RECOVERING',
    'NEW_SERVER_STATE',
  ])
    assert.doesNotMatch(bulkDispatchStateLabel(state), /aceit|concluíd/i);
  assert.equal(bulkDispatchStateLabel('ACCEPTED'), 'Aceito pelo eSocial');
});

test('bulk item guidance uses user-facing diagnostics and never dumps technical codes', () => {
  assert.equal(
    bulkDispatchItemMessage({
      id: 'a',
      employeeId: 1,
      state: 'BLOCKED',
      diagnostics: [
        { code: 'PRIVATE_TECHNICAL_CODE', message: 'Confira a matrícula.' },
      ],
    }),
    'Confira a matrícula.',
  );
  assert.doesNotMatch(
    bulkDispatchItemMessage({
      id: 'a',
      employeeId: 1,
      state: 'BLOCKED',
      diagnostics: [{ code: 'PRIVATE_TECHNICAL_CODE' }],
    }),
    /PRIVATE_TECHNICAL_CODE/,
  );
  assert.match(
    bulkDispatchItemMessage({ id: 'a', employeeId: 1, state: 'NO_CHANGES' }),
    /Nenhum evento adicional/,
  );
});
