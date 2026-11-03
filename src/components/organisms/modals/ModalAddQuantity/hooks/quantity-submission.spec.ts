import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  isSstMutationCancelled,
  SstMutationCancelledError,
} from '../../../../../@v2/features/sst-operational/mutation-decision.ts';
import { submitQuantityCallback } from './quantity-submission.ts';

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

const draft = () => ({ twaValue: '12', measuredOn: '2026-04-01' });

test('a pending save keeps the editor open until the callback actually resolves', async () => {
  const pending = deferred<{ id: string }>();
  let closed = 0;
  let completed = false;
  const save = submitQuantityCallback({
    save: () => pending.promise,
    close: () => {
      closed++;
    },
    isCancelled: isSstMutationCancelled,
  }).then((outcome) => {
    completed = true;
    return outcome;
  });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(closed, 0);
  assert.equal(completed, false);
  pending.resolve({ id: 'actual-save-result' });
  assert.equal(await save, 'SAVED');
  assert.equal(closed, 1);
  assert.equal(completed, true);
});

test('the close callback runs once after the asynchronous save has committed its result', async () => {
  const pending = deferred<void>();
  const order: string[] = [];
  let saved = false;
  const completion = submitQuantityCallback({
    save: async () => {
      order.push('save-start');
      await pending.promise;
      saved = true;
      order.push('save-completed');
    },
    close: () => {
      assert.equal(saved, true);
      order.push('close');
    },
    isCancelled: isSstMutationCancelled,
  });
  assert.deepEqual(order, ['save-start']);
  pending.resolve();
  assert.equal(await completion, 'SAVED');
  assert.deepEqual(order, ['save-start', 'save-completed', 'close']);
});

test('a legacy synchronous callback returning undefined still closes successfully', async () => {
  let saves = 0;
  let closes = 0;
  assert.equal(
    await submitQuantityCallback({
      save: () => {
        saves++;
      },
      close: () => {
        closes++;
      },
      isCancelled: isSstMutationCancelled,
    }),
    'SAVED',
  );
  assert.equal(saves, 1);
  assert.equal(closes, 1);
});

test('an asynchronous callback resolving undefined is also a completed save', async () => {
  let closes = 0;
  assert.equal(
    await submitQuantityCallback({
      save: async () => undefined,
      close: () => {
        closes++;
      },
      isCancelled: isSstMutationCancelled,
    }),
    'SAVED',
  );
  assert.equal(closes, 1);
});

test('a synchronous SST cancellation preserves the measurement draft and keeps its editor open', async () => {
  let values: ReturnType<typeof draft> | null = draft();
  let closes = 0;
  const outcome = await submitQuantityCallback({
    save: () => {
      throw new SstMutationCancelledError();
    },
    close: () => {
      closes++;
      values = null;
    },
    isCancelled: isSstMutationCancelled,
  });
  assert.equal(outcome, 'CANCELLED');
  assert.equal(closes, 0);
  assert.deepEqual(values, draft());
});

test('a delayed SST decision cancellation is consumed without closing or resetting the draft', async () => {
  const decision = deferred<void>();
  let values: ReturnType<typeof draft> | null = draft();
  let closes = 0;
  const completion = submitQuantityCallback({
    save: () => decision.promise,
    close: () => {
      closes++;
      values = null;
    },
    isCancelled: isSstMutationCancelled,
  });
  await Promise.resolve();
  assert.deepEqual(values, draft());
  decision.reject(new SstMutationCancelledError());
  assert.equal(await completion, 'CANCELLED');
  assert.equal(closes, 0);
  assert.deepEqual(values, draft());
});

test('the user can explicitly retry the preserved draft after cancelling the first decision', async () => {
  let values: ReturnType<typeof draft> | null = draft();
  let saved: ReturnType<typeof draft> | undefined;
  let closes = 0;
  const close = () => {
    closes++;
    values = null;
  };
  assert.equal(
    await submitQuantityCallback({
      save: () => Promise.reject(new SstMutationCancelledError()),
      close,
      isCancelled: isSstMutationCancelled,
    }),
    'CANCELLED',
  );
  assert.equal(
    await submitQuantityCallback({
      save: async () => {
        saved = { ...values! };
      },
      close,
      isCancelled: isSstMutationCancelled,
    }),
    'SAVED',
  );
  assert.deepEqual(saved, draft());
  assert.equal(values, null);
  assert.equal(closes, 1);
});

test('a network rejection retains its exact identity and never invokes close', async () => {
  const failure = new Error('synthetic network unavailable');
  let closes = 0;
  await assert.rejects(
    submitQuantityCallback({
      save: () => Promise.reject(failure),
      close: () => {
        closes++;
      },
      isCancelled: isSstMutationCancelled,
    }),
    (error) => error === failure,
  );
  assert.equal(closes, 0);
});

test('an HTTP validation or server error remains observable and does not clear the editor', async () => {
  for (const status of [400, 409, 500]) {
    const failure = {
      response: { status, data: { code: 'REAL_SAVE_FAILURE' } },
    };
    let values: ReturnType<typeof draft> | null = draft();
    await assert.rejects(
      submitQuantityCallback({
        save: async () => {
          throw failure;
        },
        close: () => {
          values = null;
        },
        isCancelled: isSstMutationCancelled,
      }),
      (error) => error === failure,
    );
    assert.deepEqual(values, draft());
  }
});

test('a matching cancellation message without the SST cancellation code is not swallowed', async () => {
  const failure = new Error(new SstMutationCancelledError().message);
  assert.equal(isSstMutationCancelled(failure), false);
  await assert.rejects(
    submitQuantityCallback({
      save: () => {
        throw failure;
      },
      close: () =>
        assert.fail('an unrecognized cancellation cannot count as a save'),
      isCancelled: isSstMutationCancelled,
    }),
    (error) => error === failure,
  );
});

test('an unrelated cancellation code is propagated rather than converted into SST cancellation', async () => {
  const failure = { code: 'NETWORK_ABORTED', message: 'cancelled' };
  await assert.rejects(
    submitQuantityCallback({
      save: () => Promise.reject(failure),
      close: () =>
        assert.fail('an unrelated cancellation must not close the draft'),
      isCancelled: isSstMutationCancelled,
    }),
    (error) => error === failure,
  );
});

test('a synchronous non-cancellation save exception propagates before any close', async () => {
  const failure = new TypeError('synthetic callback failure');
  await assert.rejects(
    submitQuantityCallback({
      save: () => {
        throw failure;
      },
      close: () => assert.fail('a failed callback cannot close the editor'),
      isCancelled: isSstMutationCancelled,
    }),
    (error) => error === failure,
  );
});

test('a close failure after a successful save is not disguised as a cancelled save', async () => {
  const failure = new Error('synthetic close failure');
  let saves = 0;
  await assert.rejects(
    submitQuantityCallback({
      save: async () => {
        saves++;
      },
      close: () => {
        throw failure;
      },
      isCancelled: isSstMutationCancelled,
    }),
    (error) => error === failure,
  );
  assert.equal(saves, 1);
});
