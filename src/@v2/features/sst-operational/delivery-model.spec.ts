import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  canCancelRun,
  canConfirmRun,
  canRetryRun,
  declarationOperationLabel,
  declarationDeliveryLabel,
  declarationStatusLabel,
  deliveryStateLabel,
  hasAcceptedDeclaration,
  isNoChange,
  type DeclarationRun,
} from './delivery-model.ts';

const run = (patch: Partial<DeclarationRun> = {}): DeclarationRun => ({
  id: 'preparation',
  state: 'READY',
  environment: 2,
  sourceHash: 'head',
  diagnostics: [],
  events: [
    { id: 'event', employmentId: 'employment', effectiveFrom: '2026-01-01' },
  ],
  ...patch,
});

test('confirmation requires a complete reviewed run and the enabled environment', () => {
  assert.equal(canConfirmRun(run(), true), true);
  assert.equal(canConfirmRun(run(), false), false);
  assert.equal(canConfirmRun(run({ state: 'BLOCKED' }), true), false);
  assert.equal(canConfirmRun(run({ sourceHash: undefined }), true), false);
  assert.equal(
    canConfirmRun(run({ diagnostics: [{ code: 'WORKER_CPF_INVALID' }] }), true),
    false,
  );
  assert.equal(
    canConfirmRun(
      run({
        events: [
          {
            ...run().events[0],
            diagnostics: [{ code: 'MEASUREMENT_UNIT_UNSUPPORTED' }],
          },
        ],
      }),
      true,
    ),
    false,
  );
});

test('no difference is shown as a result without offering an empty transmission', () => {
  assert.equal(isNoChange(run({ events: [] })), true);
  assert.equal(canConfirmRun(run({ events: [] }), true), false);
  assert.equal(
    isNoChange(
      run({ events: [], diagnostics: [{ code: 'NO_DECLARABLE_PERIOD' }] }),
    ),
    false,
  );
});

test('queued or accepted declarations never offer confirmation a second time', () => {
  for (const state of [
    'QUEUED',
    'SENDING',
    'POLLING',
    'ACCEPTED',
    'REJECTED',
  ]) {
    assert.equal(
      canConfirmRun(
        run({ events: [{ ...run().events[0], delivery: { state } }] }),
        true,
      ),
      false,
    );
  }
  assert.equal(hasAcceptedDeclaration([run()]), false);
  assert.equal(
    hasAcceptedDeclaration([
      run({
        events: [
          {
            ...run().events[0],
            delivery: { state: 'ACCEPTED', receipt: 'official' },
          },
        ],
      }),
    ]),
    true,
  );
});

test('cancellation and retry protect uncertain results and individual mixed states', () => {
  const withDelivery = (state: string, protocol?: string, errorCode?: string) =>
    run({
      events: [
        { ...run().events[0], delivery: { state, protocol, errorCode } },
      ],
    });
  assert.equal(canCancelRun(withDelivery('QUEUED')), true);
  assert.equal(canCancelRun(withDelivery('REJECTED', 'protocol')), true);
  for (const state of [
    'SENDING',
    'ACCEPTED',
    'UNCERTAIN',
    'POLLING',
    'CANCELLED',
  ])
    assert.equal(canCancelRun(withDelivery(state)), false);
  assert.equal(canCancelRun(withDelivery('BLOCKED', 'protocol')), false);
  assert.equal(
    canRetryRun(withDelivery('BLOCKED', undefined, 'PRE_SEND_BLOCKED'), true),
    true,
  );
  assert.equal(
    canRetryRun(withDelivery('BLOCKED', 'protocol', 'PRE_SEND_BLOCKED'), true),
    false,
  );
  assert.equal(
    canRetryRun(withDelivery('BLOCKED', undefined, 'OTHER_ERROR'), true),
    false,
  );
  assert.equal(
    canRetryRun(withDelivery('BLOCKED', undefined, 'PRE_SEND_BLOCKED'), false),
    false,
  );
  assert.equal(
    canCancelRun(
      run({
        events: [
          ...withDelivery('QUEUED').events,
          ...withDelivery('ACCEPTED').events,
        ],
      }),
    ),
    false,
  );
});

test('readiness, receipt and rectification use distinct labels', () => {
  assert.equal(deliveryStateLabel('READY'), 'Pronto para conferir');
  assert.equal(deliveryStateLabel('ACCEPTED'), 'Aceito pelo eSocial');
  assert.equal(
    declarationOperationLabel({
      ...run().events[0],
      operation: 'RECTIFICATION',
    }),
    'Retificação do período',
  );
  assert.match(deliveryStateLabel('NEW_STATE'), /NEW_STATE/);
  assert.equal(declarationStatusLabel(run()), 'Pronto para conferir');
  assert.equal(
    declarationStatusLabel(
      run({
        events: [
          {
            ...run().events[0],
            delivery: { state: 'ACCEPTED', receipt: 'official' },
          },
        ],
      }),
    ),
    'Todos os eventos aceitos pelo eSocial',
  );
  assert.equal(
    declarationStatusLabel(
      run({ events: [{ ...run().events[0], delivery: { state: 'UNKNOWN' } }] }),
    ),
    'Há resultados em reconciliação',
  );
});

test('a stale sending policy blocks confirmation and retry, while accepted receipts retain their status', () => {
  assert.equal(canConfirmRun(run({ policyStale: true }), true), false);
  assert.equal(isNoChange(run({ policyStale: true, events: [] })), false);
  assert.equal(
    canRetryRun(
      run({
        policyStale: true,
        events: [
          {
            ...run().events[0],
            delivery: { state: 'BLOCKED', errorCode: 'PRE_SEND_BLOCKED' },
          },
        ],
      }),
      true,
    ),
    false,
  );
  assert.equal(
    declarationStatusLabel(run({ policyStale: true })),
    'Prepare novamente com a data inicial atual',
  );
  assert.equal(
    declarationStatusLabel(
      run({
        policyStale: true,
        events: [
          {
            ...run().events[0],
            delivery: { state: 'ACCEPTED', receipt: 'official' },
          },
        ],
      }),
    ),
    'Todos os eventos aceitos pelo eSocial',
  );
});

test('exclusion flags preserve accepted receipts and distinguish uncertain exclusions', () => {
  assert.equal(
    declarationDeliveryLabel({ state: 'ACCEPTED', receipt: 'official' }),
    'Aceito pelo eSocial',
  );
  assert.equal(
    declarationDeliveryLabel({
      state: 'ACCEPTED',
      receipt: 'official',
      excluded: true,
    }),
    'Aceito — excluído pelo eSocial',
  );
  assert.equal(
    declarationDeliveryLabel({
      state: 'ACCEPTED',
      receipt: 'official',
      exclusionPending: true,
    }),
    'Exclusão em confirmação',
  );
  assert.equal(
    hasAcceptedDeclaration([
      run({
        events: [
          {
            ...run().events[0],
            delivery: { state: 'ACCEPTED', excluded: true },
          },
        ],
      }),
    ]),
    false,
  );
  assert.equal(
    hasAcceptedDeclaration([
      run({
        events: [
          {
            ...run().events[0],
            delivery: { state: 'ACCEPTED', exclusionPending: true },
          },
        ],
      }),
    ]),
    true,
  );
});
