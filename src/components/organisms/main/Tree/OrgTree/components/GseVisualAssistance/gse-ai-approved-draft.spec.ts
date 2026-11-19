import assert from 'node:assert/strict';
import {
  stageAiApprovedGse,
  type AiApprovedGseDraft,
} from './gse-ai-approved-draft';
import { summarizeApprovedGseAdditions } from './gse-approved-additions';
import {
  approvedSaveRequest,
  assertSaveReceipt,
  reconcileSavedReview,
} from './gse-additive-save';
import { emptyIntegratedReview } from './gse-integrated-review.model';
import type { ITreeMap } from '../../interfaces';
import { TreeTypeEnum as T } from '../../enums/tree-type.enums';
const nodes = Object.fromEntries(
  [
    ['w', T.WORKSPACE, null],
    ['a//w', T.OFFICE, 'w'],
    ['b//w', T.OFFICE, 'w'],
    ['x//other', T.OFFICE, 'other'],
  ].map(([id, type, parentId]) => [
    id,
    { id, type, parentId, label: id, childrenIds: [], ghos: [], expand: false },
  ]),
) as ITreeMap;
const draft: AiApprovedGseDraft = {
  id: '@visual-gse:ai-test//w',
  name: 'Manutenção mecânica',
  description: 'Atividades revisadas pelo profissional.',
  hierarchyIds: ['a', 'b'],
  decision: 'accepted',
};
let review = stageAiApprovedGse(emptyIntegratedReview(), draft, nodes, 'w');
assert.equal(review.newGroups.length, 1);
assert.equal(review.changes.length, 2);
const summary = summarizeApprovedGseAdditions({
  companyId: 'c',
  workspaceId: 'w',
  nodes,
  groups: [],
  review,
  stale: false,
});
assert.equal(summary.applicable, true);
const request = approvedSaveRequest(summary, 'w', 'synthetic-confirmation-123');
assert.deepEqual(
  request.commands.map((c) => c.kind),
  ['CREATE_GSE', 'ADD_LINK', 'ADD_LINK'],
);
// Repeated acceptance replaces the same draft rather than duplicating groups or links.
review = stageAiApprovedGse(review, draft, nodes, 'w');
assert.equal(review.newGroups.length, 1);
assert.equal(review.changes.length, 2);
const second = {
  ...draft,
  id: '@visual-gse:ai-second//w',
  name: 'Planejamento',
  hierarchyIds: ['a'],
};
review = stageAiApprovedGse(review, second, nodes, 'w');
const reopened = stageAiApprovedGse(
  review,
  { ...draft, decision: 'pending' },
  nodes,
  'w',
);
assert.equal(reopened.newGroups.length, 1);
assert.equal(reopened.newGroups[0].id, second.id);
assert.equal(reopened.changes.length, 1);
const snapshot = JSON.stringify(review);
assert.throws(
  () =>
    stageAiApprovedGse(
      review,
      { ...draft, hierarchyIds: ['a', 'x'] },
      nodes,
      'w',
    ),
  /fora do estabelecimento/,
);
assert.throws(
  () =>
    stageAiApprovedGse(
      review,
      { ...draft, id: '@visual-gse:ai-test//other' },
      nodes,
      'w',
    ),
  /incompatível/,
);
assert.throws(
  () => stageAiApprovedGse(review, { ...draft, hierarchyIds: [] }, nodes, 'w'),
  /cargos/,
);
assert.throws(
  () =>
    stageAiApprovedGse(
      review,
      { ...draft, description: 'x'.repeat(2001) },
      nodes,
      'w',
    ),
  /2000/,
);
assert.equal(JSON.stringify(review), snapshot);
// Nothing is persisted without the separate request and matching receipt.
const receipt = {
  contractVersion: 'GSE_ASSISTED_ADDITIVE_V1',
  receiptId: 'r',
  companyId: 'c',
  workspaceId: 'w',
  idempotencyKey: request.idempotencyKey,
  createdGroups: [{ temporaryId: draft.id, id: 'saved', name: draft.name }],
  links: ['a', 'b'].map((hierarchyId) => ({
    groupId: 'saved',
    hierarchyId,
    linkId: 1,
    outcome: 'ADDED',
  })),
  createdCount: 1,
  addedLinkCount: 2,
  completedAt: '2026-11-19',
};
assertSaveReceipt(receipt, request, 'c', 'w');
const reconciled = reconcileSavedReview(
  stageAiApprovedGse(emptyIntegratedReview(), draft, nodes, 'w'),
  request,
  receipt,
);
assert.equal(reconciled.newGroups.length, 0);
assert.equal(reconciled.changes.length, 0);
console.log(
  'AI approval bridge: staging, scope, reopen, idempotent draft, confirmation and receipt passed',
);
