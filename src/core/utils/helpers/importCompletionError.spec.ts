import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ImportRecalculationPendingError,
  readImportRecalculationPendingError,
} from './importCompletionError.ts';

const payload = {
  code: 'IMPORT_RECALCULATION_PENDING',
  dataCommitted: true,
  retryImport: false,
  message:
    'Os empregados foram importados. Não importe o arquivo novamente. Solicite o reprocessamento dos exames.',
};
test('a committed import error is decoded from JSON Blob without replacing its binary response or original error', async () => {
  const blob = new Blob([JSON.stringify(payload)], {
    type: 'application/json',
  });
  const original = { response: { status: 409, data: blob } };
  const parsed = await readImportRecalculationPendingError(original);
  assert.ok(parsed instanceof ImportRecalculationPendingError);
  assert.equal(parsed.message, payload.message);
  assert.equal(parsed.dataCommitted, true);
  assert.equal(parsed.retryImport, false);
  assert.equal(parsed.originalError, original);
  assert.equal(parsed.response.data, blob);
  assert.equal(await readImportRecalculationPendingError(parsed), parsed);
});
test('structured and textual JSON imports preserve the warning and explicit no-retry outcome', async () => {
  for (const body of [payload, JSON.stringify(payload)]) {
    const parsed = await readImportRecalculationPendingError({
      response: { status: 409, data: body },
    });
    assert.equal(parsed?.message, payload.message);
    assert.equal(parsed?.retryImport, false);
  }
  const fallback = await readImportRecalculationPendingError({
    response: { status: 409, data: { ...payload, message: '' } },
  });
  assert.match(fallback?.message || '', /Não importe o arquivo novamente/);
});
test('uncommitted, unrelated, malformed and successful uploads keep their existing handling', async () => {
  for (const response of [
    { status: 200, data: payload },
    { status: 403, data: payload },
    { status: 409, data: { ...payload, code: 'OTHER_CONFLICT' } },
    { status: 409, data: { ...payload, dataCommitted: false } },
    { status: 409, data: { ...payload, retryImport: true } },
    { status: 409, data: { code: payload.code } },
    { status: 409, data: new Blob(['not JSON']) },
    { status: 409, data: new Blob(['x'.repeat(256 * 1024 + 1)]) },
  ])
    assert.equal(
      await readImportRecalculationPendingError({ response }),
      undefined,
    );
  assert.equal(
    await readImportRecalculationPendingError(new Error('Network failed')),
    undefined,
  );
});
