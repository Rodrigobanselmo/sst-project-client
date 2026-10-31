import assert from 'node:assert/strict';
import {
  approvedSaveRequest,
  assertSaveReceipt,
  reconcileSavedReview,
  additiveRoute,
  type SaveResult,
} from './gse-additive-save';
import type { ApprovedGseAdditionSummary } from './gse-approved-additions';
import type { IntegratedReview } from './gse-integrated-review.model';
const summary: ApprovedGseAdditionSummary = {
  newGroups: [
    {
      groupId: 'temporary',
      name: 'Edited final name',
      links: [{ nodeId: 'h//w', hierarchyId: 'h', label: 'Role' }],
    },
  ],
  existingGroups: [
    {
      groupId: 'g',
      name: 'Existing',
      links: [{ nodeId: 'other//w', hierarchyId: 'other', label: 'Other' }],
    },
  ],
  issues: [],
  skippedCovered: 0,
  excludedRemovals: 1,
  applicable: true,
};
const request = approvedSaveRequest(summary, 'w', 'synthetic-key-123456');
const receipt: SaveResult = {
  contractVersion: 'GSE_ASSISTED_ADDITIVE_V1',
  receiptId: 'receipt',
  companyId: 'c',
  workspaceId: 'w',
  idempotencyKey: request.idempotencyKey,
  createdGroups: [
    { temporaryId: 'temporary', id: 'real', name: 'Edited final name' },
  ],
  links: [
    { groupId: 'real', hierarchyId: 'h', linkId: 1, outcome: 'ADDED' },
    { groupId: 'g', hierarchyId: 'other', linkId: 2, outcome: 'COVERED' },
  ],
  createdCount: 1,
  addedLinkCount: 1,
  completedAt: '2026-10-31T00:00:00.000Z',
};
let count = 0;
const test = (name: string, fn: () => void) => {
  fn();
  count++;
  console.log('PASS', name);
};
test('request contains only additive commands with final name and selected workspace', () => {
  assert.equal(request.commands[0].kind, 'CREATE_GSE');
  assert.equal((request.commands[0] as any).name, 'Edited final name');
  assert.deepEqual((request.commands[0] as any).workspaceIds, ['w']);
  assert.equal(request.commands.length, 3);
  assert(!JSON.stringify(request).includes('REMOVE'));
  assert.equal(
    additiveRoute('c', 'w'),
    'v2/companies/c/workspaces/w/gse-changes/additive',
  );
});
test('empty or oversized batch is refused before network', () => {
  assert.throws(() =>
    approvedSaveRequest({ ...summary, applicable: false }, 'w', 'key'),
  );
  assert.throws(() =>
    approvedSaveRequest(
      {
        ...summary,
        newGroups: Array.from({ length: 101 }, (_, i) => ({
          ...summary.newGroups[0],
          groupId: String(i),
        })),
      },
      'w',
      'key',
    ),
  );
});
test('receipt must identify the exact request and context, not just an HTTP success', () => {
  assertSaveReceipt(receipt, request, 'c', 'w');
  for (const change of [
    { workspaceId: 'foreign' },
    { companyId: 'foreign' },
    { idempotencyKey: 'wrong' },
    { createdGroups: [] },
    { links: [] },
    { addedLinkCount: 99 },
    { contractVersion: 'unexpected' },
  ])
    assert.throws(() =>
      assertSaveReceipt({ ...receipt, ...change }, request, 'c', 'w'),
    );
});
test('failed or incomplete API response never clears original decisions', () => {
  const review: IntegratedReview = {
    newGroups: [
      { id: 'temporary', name: 'Edited final name', decision: 'accepted' },
    ],
    changes: [
      {
        id: 'x',
        groupId: 'temporary',
        nodeId: 'h//w',
        kind: 'ADD',
        decision: 'accepted',
        reason: 'review',
      },
    ],
  };
  const before = JSON.stringify(review);
  assert.throws(() => assertSaveReceipt({ status: 200 }, request, 'c', 'w'));
  assert.equal(JSON.stringify(review), before);
});
test('confirmed result removes executed decisions and maps pending/rejected links to persisted IDs', () => {
  const review: IntegratedReview = {
    newGroups: [
      { id: 'temporary', name: 'Edited final name', decision: 'accepted' },
      { id: 'later', name: 'Later', decision: 'pending' },
    ],
    changes: [
      {
        id: 'done',
        groupId: 'temporary',
        nodeId: 'h//w',
        kind: 'ADD',
        decision: 'accepted',
        reason: 'review',
      },
      {
        id: 'pending',
        groupId: 'temporary',
        nodeId: 'pending//w',
        kind: 'ADD',
        decision: 'pending',
        reason: 'review',
      },
      {
        id: 'rejected',
        groupId: 'temporary',
        nodeId: 'rejected//w',
        kind: 'ADD',
        decision: 'rejected',
        reason: 'review',
      },
      {
        id: 'remove',
        groupId: 'g',
        nodeId: 'remove//w',
        kind: 'REMOVE',
        decision: 'accepted',
        reason: 'review',
      },
    ],
  };
  const before = JSON.stringify(review);
  const next = reconcileSavedReview(review, request, receipt);
  assert.equal(next.newGroups.length, 1);
  assert.equal(next.changes.length, 3);
  assert.equal(next.changes[0].groupId, 'real');
  assert.equal(next.changes[0].decision, 'pending');
  assert.equal(next.changes[1].decision, 'rejected');
  assert.equal(next.changes[2].kind, 'REMOVE');
  assert.deepEqual(reconcileSavedReview(next, request, receipt), next);
  assert.equal(JSON.stringify(review), before);
});
console.log(`${count} additive client contract tests passed.`);
