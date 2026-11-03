import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  clearSstEditContext,
  localCivilToday,
  readSstEditContext,
  saveSstEditContext,
  sstDecisionCompanyId,
  sstEditSuggestion,
} from './edit-context.ts';
const companyA = '11111111-1111-4111-8111-111111111111';
const companyB = '22222222-2222-4222-8222-222222222222';
function storage() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (id: string) => values.get(id) || null,
    setItem: (id: string, value: string) => {
      values.set(id, value);
    },
    removeItem: (id: string) => {
      values.delete(id);
    },
  };
}
test('new-condition suggestions are isolated per user and receiving company, without reason or reusable consent', () => {
  const s = storage();
  saveSstEditContext(s, 1, companyA, '2026-04-01', '2026-10-27');
  assert.deepEqual(readSstEditContext(s, 1, companyA), {
    version: 1,
    effectiveFrom: '2026-04-01',
    confirmedOn: '2026-10-27',
  });
  assert.equal(readSstEditContext(s, 2, companyA), undefined);
  assert.equal(readSstEditContext(s, 1, companyB), undefined);
  assert.doesNotMatch(
    [...s.values.values()].join(''),
    /reason|CORRECTION|expectedHead|operationId/,
  );
  clearSstEditContext(s, 1, companyA);
  assert.equal(readSstEditContext(s, 1, companyA), undefined);
});
test('civil today uses local calendar components without a UTC day conversion', () => {
  assert.equal(localCivilToday(new Date(2026, 9, 27, 23, 59)), '2026-10-27');
});
test('a suggestion from another day requires explicit renewal instead of carrying old consent forward', () => {
  assert.deepEqual(sstEditSuggestion(undefined, '2026-10-27'), {
    effectiveFrom: '2026-10-27',
    needsRenewal: false,
  });
  assert.deepEqual(
    sstEditSuggestion(
      { version: 1, effectiveFrom: '2026-04-01', confirmedOn: '2026-10-27' },
      '2026-10-27',
    ),
    { effectiveFrom: '2026-04-01', needsRenewal: false },
  );
  assert.deepEqual(
    sstEditSuggestion(
      { version: 1, effectiveFrom: '2026-04-01', confirmedOn: '2026-10-26' },
      '2026-10-27',
    ),
    { effectiveFrom: '2026-04-01', needsRenewal: true },
  );
});
test('blocked storage and malformed dates never stop an edit or create a valid suggestion', () => {
  const broken = {
    getItem: () => {
      throw new Error('restricted');
    },
    setItem: () => {
      throw new Error('full');
    },
    removeItem: () => {
      throw new Error('restricted');
    },
  };
  assert.equal(readSstEditContext(broken, 1, companyA), undefined);
  assert.doesNotThrow(() =>
    saveSstEditContext(broken, 1, companyA, '2026-04-01'),
  );
  assert.doesNotThrow(() => clearSstEditContext(broken, 1, companyA));
  const s = storage();
  saveSstEditContext(s, 1, companyA, '2026-02-31');
  saveSstEditContext(s, undefined, companyA, '2026-04-01');
  assert.equal(s.values.size, 0);
});
test('request scope handles legacy JSON, multipart and company routes without guessing the actor company', () => {
  assert.equal(
    sstDecisionCompanyId(undefined, {
      data: JSON.stringify({ companyId: companyA }),
    }),
    companyA,
  );
  assert.equal(
    sstDecisionCompanyId(undefined, {
      data: { get: (name: string) => (name === 'companyId' ? companyA : null) },
    }),
    companyA,
  );
  assert.equal(
    sstDecisionCompanyId(undefined, {
      url: `/companies/${companyB}/sst-operational`,
    }),
    companyB,
  );
  assert.equal(
    sstDecisionCompanyId(undefined, {
      data: { companyId: companyA },
      url: `/companies/${companyB}/sst-operational`,
    }),
    undefined,
  );
  assert.equal(
    sstDecisionCompanyId(companyA, { data: { companyId: companyB } }),
    companyA,
  );
  assert.equal(
    sstDecisionCompanyId(undefined, { url: '/risk-data' }),
    undefined,
  );
});
