import assert from 'node:assert/strict';
import { addReviewChange } from './gse-integrated-review.model';
import { summarizeApprovedGseAdditions } from './gse-approved-additions';
import type { AssistanceContextValue } from './GseVisualAssistance.context';
import type { ITreeMapObject } from '../../interfaces';
import { TreeTypeEnum as T } from '../../enums/tree-type.enums';
import { hasActiveGseTreeLink } from 'core/utils/gse-effective-office-membership.util';
import type { IGho } from 'core/interfaces/api/IGho';
const g = {
  id: 'g',
  name: 'Existente',
  companyId: 'c',
  workspaceIds: ['w'],
  status: 'ACTIVE',
  type: 0,
} as IGho;
const node = (
  id: string,
  type: T,
  parentId: string | null,
  ghos: IGho[] = [],
): ITreeMapObject => ({
  id,
  type,
  parentId,
  ghos,
  label: id,
  childrenIds: [],
  expand: false,
});
const context = () =>
  ({
    companyId: 'c',
    workspaceId: 'w',
    stale: false,
    groups: [g],
    nodes: {
      w: node('w', T.WORKSPACE, null),
      's//w': node('s//w', T.SECTOR, 'w'),
      'a//w': node('a//w', T.OFFICE, 's//w'),
      'b//w': node('b//w', T.OFFICE, 's//w'),
      'f//foreign': node('f//foreign', T.OFFICE, 'foreign'),
    },
    review: { newGroups: [], changes: [] },
  }) as unknown as AssistanceContextValue;
const change = (
  nodeId: string,
  groupId = 'g',
  decision: 'accepted' | 'pending' | 'rejected' = 'accepted',
  kind: 'ADD' | 'REMOVE' = 'ADD',
) => ({
  id: JSON.stringify([groupId, nodeId]),
  nodeId,
  groupId,
  decision,
  kind,
  reason: 'review',
});
let count = 0;
const test = (name: string, fn: () => void) => {
  fn();
  count++;
  console.log('PASS', name);
};
test('the tree drops ended and deleted links without dropping another active period', () => {
  const history = [
    { hierarchyId: 'a', endDate: '2026-11-08' },
    { hierarchyId: 'a', deletedAt: '2026-11-08' },
    { hierarchyId: 'a', workspaceId: 'other' },
    { hierarchyId: 'b' },
  ];
  assert.equal(hasActiveGseTreeLink(history, 'a', 'w'), false);
  assert.equal(hasActiveGseTreeLink(history, 'b', 'w'), true);
  assert.equal(hasActiveGseTreeLink([...history, { hierarchyId: 'a' }], 'a', 'w'), true);
});
test('no approved operations disables confirmation, pending and rejected never count', () => {
  const c = context();
  c.review.changes = [
    change('a//w', 'g', 'pending'),
    change('b//w', 'g', 'rejected'),
  ];
  assert.equal(summarizeApprovedGseAdditions(c).applicable, false);
});
test('approved addition enables summary, reopening or rejection removes authorization', () => {
  const c = context();
  c.review.changes = [change('a//w')];
  assert.equal(summarizeApprovedGseAdditions(c).applicable, true);
  for (const decision of ['pending', 'rejected'] as const) {
    c.review.changes[0].decision = decision;
    assert.equal(summarizeApprovedGseAdditions(c).applicable, false);
  }
});
test('manual addition stages only the selected direct link for confirmation', () => {
  const c = context();
  c.nodes['a//w'].ghos = [g];
  c.review = addReviewChange(c.review, c.nodes, c.groups, 'w', 'g', 'b//w', 'ADD', true);
  assert.equal(c.review.changes[0].decision, 'accepted');
  assert.deepEqual(summarizeApprovedGseAdditions(c).existingGroups[0].links.map((link) => link.hierarchyId), ['b']);
  assert.deepEqual(c.nodes['a//w'].ghos, [g]);
  c.nodes['s//w'].ghos = [g];
  assert.throws(() => addReviewChange(c.review, c.nodes, c.groups, 'w', 'g', 'b//w', 'ADD', true), /vínculo superior/);
});
test('final reviewed name and only approved links of approved creation appear', () => {
  const c = context();
  c.review.newGroups = [
    { id: 'new', name: ' Nome revisado ', decision: 'accepted' },
  ];
  c.review.changes = [change('a//w', 'new'), change('b//w', 'new', 'pending')];
  const p = summarizeApprovedGseAdditions(c);
  assert.equal(p.newGroups[0].name, 'Nome revisado');
  assert.deepEqual(
    p.newGroups[0].links.map((l) => l.hierarchyId),
    ['a'],
  );
  c.review.newGroups[0].decision = 'rejected';
  assert.equal(summarizeApprovedGseAdditions(c).applicable, false);
});
test('creation approval does not implicitly approve pending links', () => {
  const c = context();
  c.review.newGroups = [{ id: 'new', name: 'Novo', decision: 'accepted' }];
  c.review.changes = [
    change('a//w', 'new', 'pending'),
    change('b//w', 'new', 'rejected'),
  ];
  const p = summarizeApprovedGseAdditions(c);
  assert.equal(p.newGroups.length, 1);
  assert.equal(p.newGroups[0].links.length, 0);
});
test('approved removals never produce an executable addition or remove existing coverage', () => {
  const c = context();
  c.nodes['s//w'].ghos = [g];
  c.review.changes = [
    change('s//w', 'g', 'accepted', 'REMOVE'),
    change('a//w'),
  ];
  const p = summarizeApprovedGseAdditions(c);
  assert.equal(p.applicable, false);
  assert.equal(p.excludedRemovals, 1);
  assert.equal(p.skippedCovered, 1);
});
test('duplicates, existing direct and inherited coverage are omitted', () => {
  const c = context();
  c.nodes['a//w'].ghos = [g];
  c.review.changes = [change('a//w'), change('b//w'), change('b//w')];
  const p = summarizeApprovedGseAdditions(c);
  assert.equal(p.existingGroups[0].links.length, 1);
  assert.equal(p.skippedCovered, 1);
});
test('accepted ancestor prunes redundant child, pending ancestor does not', () => {
  const c = context();
  c.review.changes = [change('a//w'), change('s//w')];
  assert.deepEqual(
    summarizeApprovedGseAdditions(c).existingGroups[0].links.map(
      (l) => l.nodeId,
    ),
    ['s//w'],
  );
  c.review.changes[1].decision = 'pending';
  assert.deepEqual(
    summarizeApprovedGseAdditions(c).existingGroups[0].links.map(
      (l) => l.nodeId,
    ),
    ['a//w'],
  );
});
test('foreign company, workspace, missing nodes and stale context block summary', () => {
  for (const mode of ['workspace', 'company', 'missing', 'stale']) {
    const c = context();
    c.review.changes = [change('a//w')];
    if (mode === 'workspace') c.review.changes[0].nodeId = 'f//foreign';
    if (mode === 'company') c.groups = [{ ...g, companyId: 'foreign' }];
    if (mode === 'missing') c.review.changes[0].nodeId = 'missing';
    if (mode === 'stale') c.stale = true;
    const p = summarizeApprovedGseAdditions(c);
    assert.equal(p.applicable, false);
    assert(p.issues.length);
  }
});
test('duplicate names and empty name block local summary without pretending server uniqueness', () => {
  for (const name of ['', 'Existente']) {
    const c = context();
    c.review.newGroups = [{ id: 'new', name, decision: 'accepted' }];
    assert.equal(summarizeApprovedGseAdditions(c).applicable, false);
  }
});
test('summary is pure, keeps unexecuted review and contains no removals/dates/authority', () => {
  const c = context();
  c.review.changes = [
    change('a//w'),
    change('b//w', 'g', 'accepted', 'REMOVE'),
  ];
  const before = JSON.stringify(c);
  const p = summarizeApprovedGseAdditions(c);
  assert.equal(JSON.stringify(c), before);
  assert(!JSON.stringify(p.existingGroups).includes('REMOVE'));
  assert(!JSON.stringify(p).includes('startDate'));
  assert(!JSON.stringify(p).includes('receipt'));
});
console.log(`${count} approved-addition summary tests passed.`);
