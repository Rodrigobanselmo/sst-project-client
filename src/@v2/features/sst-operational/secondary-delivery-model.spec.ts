import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canCancelSecondary,
  canConfirmSecondary,
  canRetrySecondary,
  secondaryPreparationLabel,
  secondaryDisplayLabel,
  secondarySourceHasChanged,
  secondaryRequestKey,
  secondaryReviews,
  secondarySourceOptions,
  secondarySourceHasNoChanges,
  secondaryPrepareRequest,
  type SecondaryPreparation,
} from './secondary-delivery-model.ts';

const ready: SecondaryPreparation = {
  id: 'preparation',
  type: 'S-3000',
  environment: 2,
  state: 'READY',
  sourceHash: 'snapshot-hash',
  diagnostics: [],
  source: { id: 'accepted-delivery', label: 'CAT do empregado' },
};

test('secondary confirmations require a ready, current preparation and enabled transmission', () => {
  assert.equal(canConfirmSecondary(ready, true), true);
  assert.equal(canConfirmSecondary(ready, false), false);
  assert.equal(
    canConfirmSecondary(
      { ...ready, diagnostics: [{ code: 'INVALID_SOURCE' }] },
      true,
    ),
    false,
  );
  assert.equal(
    canConfirmSecondary({ ...ready, state: 'BLOCKED' }, true),
    false,
  );
  assert.equal(canConfirmSecondary({ ...ready, sourceHash: '' }, true), false);
  assert.equal(
    canConfirmSecondary({ ...ready, delivery: { state: 'QUEUED' } }, true),
    false,
  );
});

test('secondary uncertain, processing and accepted deliveries cannot be cancelled or retried', () => {
  for (const state of [
    'SENDING',
    'PROCESSING',
    'POLLING',
    'UNKNOWN',
    'RECOVERING',
    'ACCEPTED',
  ]) {
    const event = { ...ready, delivery: { state } };
    assert.equal(canCancelSecondary(event), false, state);
    assert.equal(canRetrySecondary(event, true), false, state);
  }
});

test('cancellation does not resend a submitted or accepted delivery', () => {
  assert.equal(
    canCancelSecondary({ ...ready, delivery: { state: 'QUEUED' } }),
    true,
  );
  assert.equal(
    canCancelSecondary({
      ...ready,
      delivery: { state: 'QUEUED', protocol: 'received' },
    }),
    false,
  );
  assert.equal(
    canCancelSecondary({
      ...ready,
      delivery: { state: 'REJECTED', protocol: 'received' },
    }),
    true,
  );
  assert.equal(canCancelSecondary(ready), true);
  assert.equal(canCancelSecondary({ ...ready, state: 'BLOCKED' }), true);
  assert.equal(canCancelSecondary({ ...ready, state: 'CANCELLED' }), false);
});

test('retry requires a known pre-send failure without a government protocol', () => {
  const event = {
    ...ready,
    delivery: { state: 'BLOCKED', errorCode: 'PRE_SEND_BLOCKED' },
  };
  assert.equal(canRetrySecondary(event, true), true);
  assert.equal(canRetrySecondary(event, false), false);
  assert.equal(
    canRetrySecondary(
      { ...event, delivery: { ...event.delivery, protocol: 'received' } },
      true,
    ),
    false,
  );
  assert.equal(
    canRetrySecondary(
      { ...event, delivery: { ...event.delivery, errorCode: 'OTHER' } },
      true,
    ),
    false,
  );
});

test('idempotent preparation identity distinguishes the environment, source, target and reason', () => {
  const input = {
    type: 'S-2220' as const,
    environment: 2 as const,
    sourceId: 10,
    kind: 'ORIGINAL' as const,
    reason: 'Conferência da origem',
  };
  const key = secondaryRequestKey(input);
  assert.equal(
    secondaryRequestKey({ ...input, reason: '  Conferência da origem  ' }),
    key,
  );
  assert.notEqual(secondaryRequestKey({ ...input, environment: 1 }), key);
  assert.notEqual(secondaryRequestKey({ ...input, sourceId: 11 }), key);
  assert.notEqual(
    secondaryRequestKey({
      ...input,
      targetDeliveryId: 'accepted',
      kind: 'RECTIFICATION',
    }),
    key,
  );
});

test('preparation labels show the source and civil creation date', () => {
  assert.equal(
    secondaryPreparationLabel({ ...ready, createdAt: '2026-04-01T10:00:00Z' }),
    'CAT do empregado — 01/04/2026',
  );
  assert.equal(
    secondaryPreparationLabel({ ...ready, source: undefined }),
    'Cadastro de origem',
  );
});
test('human event labels show Brazilian civil dates without mutating IDs, receipts or API content', () => {
  const source = Object.freeze({
    id: 'source-2026-10-01',
    label: 'Toxicológico · 2026-10-01',
  });
  const event = Object.freeze({
    ...ready,
    source,
    createdAt: '2026-10-27T03:00:00Z',
  });
  const before = JSON.stringify(event);
  assert.equal(
    secondaryDisplayLabel(source.label),
    'Toxicológico · 01/10/2026',
  );
  assert.equal(
    secondaryPreparationLabel(event),
    'Toxicológico · 01/10/2026 — 27/10/2026',
  );
  assert.equal(
    secondaryDisplayLabel('S-2240 · 1.2.0000000000000000001 · 2026-04-01'),
    'S-2240 · 1.2.0000000000000000001 · 01/04/2026',
  );
  assert.equal(secondaryDisplayLabel('AB2026-10-01'), 'AB2026-10-01');
  assert.equal(
    secondaryDisplayLabel('Exame · 2026-02-29'),
    'Exame · 2026-02-29',
  );
  assert.equal(
    secondaryDisplayLabel('Exame · 2024-02-29'),
    'Exame · 29/02/2024',
  );
  assert.equal(JSON.stringify(event), before);
});
test('neutral source-update presentation keeps real hash and receipt conflict detection', () => {
  const selected = {
    id: 'source',
    label: 'Origem · 2026-10-01',
    sourceHash: 'hash',
    lastAcceptedDeliveryId: 'delivery',
    lastReceipt: 'receipt',
  };
  assert.equal(secondarySourceHasChanged(selected, { ...selected }), false);
  assert.equal(
    secondarySourceHasChanged(selected, {
      ...selected,
      label: 'Rótulo atualizado',
    }),
    false,
  );
  for (const update of [
    { sourceHash: 'changed' },
    { lastReceipt: 'changed' },
    { lastAcceptedDeliveryId: 'changed' },
  ])
    assert.equal(
      secondarySourceHasChanged(selected, { ...selected, ...update }),
      true,
    );
  assert.equal(secondarySourceHasChanged(null, selected), false);
  assert.equal(secondarySourceHasChanged(selected, undefined), false);
  assert.equal(secondarySourceHasChanged(selected, null), false);
});

test('historical review pages retain later items and deduplicate polling overlaps by source', () => {
  const first = {
    reviewId: 'review-a',
    id: 'old-aso',
    sourceId: 'old-aso',
    type: 'S-2220' as const,
    environment: 2 as const,
    label: 'ASO anterior',
    state: 'INITIAL_PENDING',
    lastCheckedAt: '2026-10-01T00:00:00Z',
  };
  const updated = {
    ...first,
    state: 'RECTIFICATION_REQUIRED',
    lastCheckedAt: '2026-10-02T00:00:00Z',
  };
  const other = {
    ...first,
    reviewId: 'review-b',
    id: 'older-aso',
    sourceId: 'older-aso',
    label: 'Outro ASO antigo',
  };
  const pages = [
    { reviews: [first], nextCursor: 'review-a' },
    { reviews: [updated, other], nextCursor: null },
  ];
  const before = JSON.stringify(pages);
  assert.deepEqual(secondaryReviews(pages, 'S-2220', 2), [updated, other]);
  assert.equal(JSON.stringify(pages), before);
});

test('historical review selection cannot mix event families or official and restricted environments', () => {
  const row = {
    reviewId: 'review',
    id: 'source',
    sourceId: 'source',
    type: 'S-2221' as const,
    environment: 2 as const,
    label: 'Exame',
    state: 'INITIAL_PENDING',
  };
  const pages = [
    {
      reviews: [
        row,
        { ...row, environment: 1 as const },
        { ...row, type: 'S-2220' as const },
      ],
      nextCursor: null,
    },
  ];
  assert.deepEqual(secondaryReviews(pages, 'S-2221', 2), [row]);
  assert.deepEqual(secondaryReviews(pages, 'S-3000', 2), []);
});

test('recent source metadata wins while older pending sources stay selectable once across pages', () => {
  const current = {
    id: '1',
    label: 'ASO atual',
    lastAcceptedDeliveryId: 'new-receipt',
    needsRectification: false,
  };
  const stale = {
    ...current,
    label: 'Rótulo anterior',
    lastAcceptedDeliveryId: 'old-receipt',
  };
  const older = { id: '2', label: 'ASO fora dos cem recentes' };
  assert.deepEqual(
    secondarySourceOptions([current], [stale, older, older], older),
    [current, older],
  );
});

test('a selected historical source survives a paginated refetch without replacing its draft identity', () => {
  const selected = {
    id: 'historical',
    label: 'ASO escolhido',
    lastAcceptedDeliveryId: 'receipt',
  };
  assert.deepEqual(secondarySourceOptions([], [], selected), [selected]);
  const current = { ...selected, lastAcceptedDeliveryId: 'new-receipt' };
  assert.deepEqual(secondarySourceOptions([], [current], selected), [current]);
});

test('only an explicitly unchanged accepted source suppresses a redundant rectification', () => {
  assert.equal(
    secondarySourceHasNoChanges({
      id: 'source',
      label: 'Fonte',
      changedSinceAccepted: false,
    }),
    false,
  );
  assert.equal(
    secondarySourceHasNoChanges({
      id: 'source',
      label: 'Fonte',
      lastAcceptedDeliveryId: 'receipt',
    }),
    false,
  );
  assert.equal(
    secondarySourceHasNoChanges({
      id: 'source',
      label: 'Fonte',
      lastAcceptedDeliveryId: 'receipt',
      changedSinceAccepted: false,
    }),
    true,
  );
  assert.equal(
    secondarySourceHasNoChanges({
      id: 'source',
      label: 'Fonte',
      lastAcceptedDeliveryId: 'receipt',
      changedSinceAccepted: false,
      needsExclusion: true,
    }),
    false,
  );
  assert.equal(
    secondarySourceHasNoChanges({
      id: 'source',
      label: 'Fonte',
      lastAcceptedDeliveryId: 'receipt',
      changedSinceAccepted: true,
    }),
    false,
  );
});

test('original secondary XML explicitly selects the full14 or base8 registration', () => {
  const input = {
    type: 'S-2221' as const,
    environment: 2 as const,
    kind: 'ORIGINAL' as const,
    source: { id: 'exam', label: 'Exame' },
    reason: 'Conferência',
    allowedRegistrations: ['11222333', '11222333000181'],
  };
  assert.throws(() => secondaryPrepareRequest(input), /Escolha a inscrição/);
  assert.throws(
    () =>
      secondaryPrepareRequest({ ...input, employerRegistration: '99999999' }),
    /Escolha a inscrição/,
  );
  const full = secondaryPrepareRequest({
    ...input,
    employerRegistration: '11222333000181',
  });
  const base = secondaryPrepareRequest({
    ...input,
    employerRegistration: '11222333',
  });
  assert.equal(full.employerRegistration, '11222333000181');
  assert.equal(base.employerRegistration, '11222333');
  assert.notEqual(
    secondaryRequestKey({ type: input.type, ...full }),
    secondaryRequestKey({ type: input.type, ...base }),
  );
});

test('rectification and exclusion derive registration and receipt from acceptance without forwarding an employer override', () => {
  const input = {
    type: 'S-2221' as const,
    environment: 2 as const,
    kind: 'RECTIFICATION' as const,
    source: {
      id: 'exam',
      label: 'Exame',
      lastAcceptedDeliveryId: 'last-accepted',
    },
    reason: 'Correção',
    employerRegistration: '99999999',
    allowedRegistrations: [],
  };
  const rectification = secondaryPrepareRequest(input);
  assert.equal(rectification.targetDeliveryId, 'last-accepted');
  assert.equal('employerRegistration' in rectification, false);
  assert.throws(
    () =>
      secondaryPrepareRequest({
        ...input,
        source: { id: 'exam', label: 'Exame' },
      }),
    /último evento aceito/,
  );
  const exclusion = secondaryPrepareRequest({
    ...input,
    type: 'S-3000',
    source: { id: 'accepted-2240', label: 'Evento aceito' },
  });
  assert.deepEqual(exclusion, {
    environment: 2,
    reason: 'Correção',
    targetDeliveryId: 'accepted-2240',
  });
  assert.equal('kind' in exclusion, false);
  assert.equal('sourceId' in exclusion, false);
  assert.equal('employerRegistration' in exclusion, false);
});
