import assert from 'node:assert/strict';

import type { InventoryPgrImportReview } from '@v2/services/security/inventory-pgr-import/service/inventory-pgr-import.types';
import {
  canApplyInventoryImportPlan,
  INVENTORY_PGR_IMPORT_STALE_CODE,
  INVENTORY_PGR_IMPORT_STALE_MESSAGE,
  inventoryImportApplyErrorMessage,
  inventoryImportApplyHint,
  isInventoryPgrImportStaleError,
  scrollInventoryImportFlowIntoView,
} from './inventory-apply-ui';

const readyReview = {
  readyForFutureApply: true,
  blockers: [],
  summary: { pendingBlockers: 0 },
} as InventoryPgrImportReview;

const blockedReview = {
  readyForFutureApply: false,
  blockers: [
    {
      code: 'PARENT_REQUIRED',
      itemType: 'role',
      itemKey: 'r1',
      type: 'PARENT_REQUIRED',
      hard: true,
      message: 'Defina o pai',
    },
  ],
  summary: { pendingBlockers: 1 },
} as InventoryPgrImportReview;

assert.equal(
  canApplyInventoryImportPlan({
    review: readyReview,
    reviewSynced: true,
    reviewPending: false,
    applyPending: false,
    softAcknowledged: true,
  }),
  true,
);

assert.equal(
  canApplyInventoryImportPlan({
    review: readyReview,
    reviewSynced: false,
    reviewPending: false,
    applyPending: false,
    softAcknowledged: true,
  }),
  false,
);

assert.equal(
  canApplyInventoryImportPlan({
    review: readyReview,
    reviewSynced: true,
    reviewPending: true,
    applyPending: false,
    softAcknowledged: true,
  }),
  false,
);

assert.equal(
  canApplyInventoryImportPlan({
    review: readyReview,
    reviewSynced: true,
    reviewPending: false,
    applyPending: true,
    softAcknowledged: true,
  }),
  false,
);

assert.equal(
  canApplyInventoryImportPlan({
    review: readyReview,
    reviewSynced: true,
    reviewPending: false,
    applyPending: false,
    softAcknowledged: false,
  }),
  false,
);

assert.equal(
  canApplyInventoryImportPlan({
    review: blockedReview,
    reviewSynced: true,
    reviewPending: false,
    applyPending: false,
    softAcknowledged: true,
  }),
  false,
);

assert.equal(
  inventoryImportApplyHint({
    review: readyReview,
    reviewSynced: true,
    reviewPending: false,
    applyPending: true,
    canApply: false,
  }),
  'Importando… aguarde a resposta da API.',
);

assert.match(
  inventoryImportApplyHint({
    review: readyReview,
    reviewSynced: true,
    reviewPending: false,
    applyPending: false,
    canApply: true,
  }),
  /Plano pronto/,
);

const staleError = {
  response: {
    data: {
      code: INVENTORY_PGR_IMPORT_STALE_CODE,
      message: INVENTORY_PGR_IMPORT_STALE_MESSAGE,
    },
  },
};
assert.equal(isInventoryPgrImportStaleError(staleError), true);
assert.equal(
  inventoryImportApplyErrorMessage(staleError),
  INVENTORY_PGR_IMPORT_STALE_MESSAGE,
);
assert.equal(
  isInventoryPgrImportStaleError({
    response: { data: { message: 'Nome inválido' } },
  }),
  false,
);

const scrolled: Array<ScrollIntoViewOptions | undefined> = [];
scrollInventoryImportFlowIntoView({
  scrollIntoView: (options) => {
    scrolled.push(options);
  },
});
assert.deepEqual(scrolled, [{ behavior: 'smooth', block: 'start' }]);
scrollInventoryImportFlowIntoView(null);
assert.equal(scrolled.length, 1);

console.log('inventory-apply-ui.spec.ts ok');
