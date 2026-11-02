import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  createSstEditSessionStore,
  SST_EDIT_SESSION_MS,
} from './edit-session.ts';
const companyA = '11111111-1111-4111-8111-111111111111';
const companyB = '22222222-2222-4222-8222-222222222222';
const headA = 'a'.repeat(64),
  headB = 'b'.repeat(64);
const input = {
  userId: 1,
  companyId: companyA,
  effectiveFrom: '2026-04-01',
  reason: ' Revisita anual ',
};
function fixture() {
  let time = 10000;
  const store = createSstEditSessionStore(() => time);
  store.bindScope(1, companyA);
  return {
    store,
    setTime: (next: number) => {
      time = next;
    },
  };
}
test('activation is explicit and two mutations receive their own fresh head without retaining it', () => {
  const { store } = fixture();
  assert.equal(store.resolve(1, companyA, headA), undefined);
  store.activate(input);
  assert.deepEqual(store.resolve(1, companyA, headA), {
    intent: 'NEW_CONDITION',
    effectiveFrom: '2026-04-01',
    reason: 'Revisita anual',
    expectedHead: headA,
  });
  assert.equal(store.resolve(1, companyA, headB)?.expectedHead, headB);
  assert.equal(store.resolve(1, companyA, 'old-head'), undefined);
  assert.doesNotMatch(
    JSON.stringify(store.snapshot()),
    /expectedHead|operationId|CORRECTION/,
  );
});
test('scope cannot cross user, target company or a later company switch back', () => {
  const { store } = fixture();
  store.activate(input);
  assert.equal(store.resolve(2, companyA, headA), undefined);
  assert.equal(store.resolve(1, companyB, headA), undefined);
  store.bindScope(1, companyB);
  assert.equal(store.snapshot(), undefined);
  store.bindScope(1, companyA);
  assert.equal(store.resolve(1, companyA, headA), undefined);
  store.activate(input);
  store.bindScope(2, companyA);
  assert.equal(store.snapshot(), undefined);
});
test('a single exception requires review and does not change the common date or reason', () => {
  const { store } = fixture();
  store.activate(input);
  store.reviewNext();
  assert.equal(store.snapshot()?.reviewNext, true);
  assert.equal(store.resolve(1, companyA, headA), undefined);
  assert.equal(store.snapshot()?.reviewNext, false);
  assert.equal(
    store.resolve(1, companyA, headB)?.effectiveFrom,
    input.effectiveFrom,
  );
  assert.equal(store.resolve(1, companyA, headB)?.reason, 'Revisita anual');
});
test('expiration boundary and a backward clock never authorize a mutation', () => {
  const { store, setTime } = fixture();
  store.activate(input);
  setTime(10000 + SST_EDIT_SESSION_MS - 1);
  assert.ok(store.resolve(1, companyA, headA));
  setTime(10000 + SST_EDIT_SESSION_MS);
  assert.equal(store.peek(1, companyA), undefined);
  assert.equal(store.resolve(1, companyA, headB), undefined);
  setTime(9999);
  assert.equal(store.resolve(1, companyA, headB), undefined);
  setTime(10001);
  assert.equal(
    store.resolve(1, companyA, headB),
    undefined,
    'an expired context cannot revive after a clock rollback',
  );
});
test('clearing, logout, and a new tab/store require a new explicit activation', () => {
  const { store } = fixture();
  store.activate(input);
  store.clear();
  assert.equal(store.resolve(1, companyA, headA), undefined);
  store.activate(input);
  store.bindScope(undefined, undefined);
  assert.equal(store.snapshot(), undefined);
  assert.equal(fixture().store.resolve(1, companyA, headA), undefined);
});
test('invalid dates, invalid scope and an empty or excessive reason cannot activate', () => {
  const { store } = fixture();
  for (const effectiveFrom of [
    '2026-02-29',
    '2026-04-31',
    '2026-13-01',
    '01/04/2026',
    '0000-01-01',
  ])
    assert.throws(() => store.activate({ ...input, effectiveFrom }));
  for (const reason of ['', '  ', 'x'.repeat(2001)])
    assert.throws(() => store.activate({ ...input, reason }));
  assert.throws(() => store.activate({ ...input, companyId: companyB }));
  store.activate({ ...input, effectiveFrom: '2024-02-29' });
  assert.ok(Object.isFrozen(store.snapshot()));
});
test('extra values cannot smuggle a reusable revision, intent or operation into a context', () => {
  const { store } = fixture();
  store.activate({
    ...input,
    expectedHead: headA,
    operationId: 'old-op',
    intent: 'CORRECTION',
  } as typeof input);
  assert.doesNotMatch(
    JSON.stringify(store.snapshot()),
    /expectedHead|operationId|intent/,
  );
  assert.equal(store.resolve(1, companyA, headB)?.intent, 'NEW_CONDITION');
});
test('subscribers observe activation and clearing, and can detach', () => {
  const { store } = fixture();
  let changes = 0;
  const detach = store.subscribe(() => {
    changes++;
  });
  store.activate(input);
  store.clear();
  assert.equal(changes, 2);
  detach();
  store.activate(input);
  assert.equal(changes, 2);
});
