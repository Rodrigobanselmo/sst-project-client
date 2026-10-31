import assert from 'node:assert/strict';
import { reconcileSavedReview } from './gse-additive-save';
import { reviewNavigation, focusReviewRegion } from './gse-review-navigation';
import { clampPanelPosition } from './GseFloatingPanel';
import type { IGho } from 'core/interfaces/api/IGho';
import type { ITreeMap, ITreeMapObject } from '../../interfaces';
import { TreeTypeEnum as T } from '../../enums/tree-type.enums';
import {
  emptyIntegratedReview,
  generateIntegratedReview,
  groupVisualState,
  linkVisual,
  addReviewChange,
  decideReviewChange,
  decideCreation,
  REVIEW_COLORS,
  effectiveReviewChanges,
  scopedExistingGroups,
} from './gse-integrated-review.model';
const g = {
  id: 'g',
  companyId: 'c',
  workspaceIds: ['w'],
  name: 'Existente',
  status: 'ACTIVE',
} as IGho;
const n = (
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
  expand: false,
  childrenIds: [],
});
const fixture = (): ITreeMap => ({
  w: n('w', T.WORKSPACE, null),
  's//w': n('s//w', T.SECTOR, 'w'),
  'a//w': n('a//w', T.OFFICE, 's//w', [g]),
  'b//w': n('b//w', T.OFFICE, 's//w'),
  'sub//w': n('sub//w', T.SUB_SECTOR, 's//w'),
  'f//wf': n('f//wf', T.OFFICE, 'wf'),
});
let count = 0;
const test = (name: string, fn: () => void) => {
  fn();
  count++;
  console.log('PASS', name);
};
test('existing group remains neutral/selectable with no proposals', () =>
  assert.equal(
    groupVisualState(emptyIntegratedReview(), 'g'),
    'EXISTENTE_SEM_ALTERACOES',
  ));
test('structural suggestion adds to existing group without renaming it', () => {
  const nodes = fixture(),
    before = JSON.stringify(nodes);
  const r = generateIntegratedReview(nodes, [g], 'c', 'w', 'review');
  assert.equal(r.changes.find((c) => c.nodeId === 'b//w')?.groupId, 'g');
  assert.equal(groupVisualState(r, 'g'), 'EXISTENTE_COM_ALTERACOES');
  assert.equal(g.name, 'Existente');
  assert.equal(JSON.stringify(nodes), before);
});
test('uncovered actual sector produces a temporary new group and blue links', () => {
  const nodes = fixture();
  nodes['a//w'].ghos = [];
  const r = generateIntegratedReview(nodes, [g], 'c', 'w', '');
  assert.equal(r.newGroups.length, 1);
  assert.equal(groupVisualState(r, r.newGroups[0].id), 'NOVO_SUGERIDO');
  assert.equal(
    linkVisual(r, nodes, [g], 'w', r.newGroups[0].id, 'a//w').kind,
    'add',
  );
});
test('direct link is green, not inherited', () => {
  const nodes = fixture();
  const v = linkVisual(emptyIntegratedReview(), nodes, [g], 'w', 'g', 'a//w');
  assert.equal(v.kind, 'existing');
  assert.deepEqual(v.sources, []);
});
test('upper link produces inherited coverage, never a direct remove operation', () => {
  const nodes = fixture();
  nodes['s//w'].ghos = [g];
  const v = linkVisual(emptyIntegratedReview(), nodes, [g], 'w', 'g', 'b//w');
  assert.equal(v.kind, 'inherited');
  assert.deepEqual(v.sources, ['s//w']);
  assert.throws(
    () =>
      addReviewChange(
        emptyIntegratedReview(),
        nodes,
        [g],
        'w',
        'g',
        'b//w',
        'REMOVE',
      ),
    /herdada/,
  );
});
test('structural redundancy produces a justified withdrawal, not authorization', () => {
  const nodes = fixture();
  nodes['s//w'].ghos = [g];
  const r = generateIntegratedReview(nodes, [g], 'c', 'w', '');
  const c = r.changes.find((c) => c.nodeId === 'a//w')!;
  assert.equal(c.kind, 'REMOVE');
  assert.match(c.reason, /PPP\/eSocial/);
  assert.equal(linkVisual(r, nodes, [g], 'w', 'g', 'a//w').kind, 'remove');
});
test('manual withdrawal of direct link makes existing group amber', () => {
  const nodes = fixture();
  const r = addReviewChange(
    emptyIntegratedReview(),
    nodes,
    [g],
    'w',
    'g',
    'a//w',
    'REMOVE',
  );
  assert.equal(groupVisualState(r, 'g'), 'EXISTENTE_COM_ALTERACOES');
  assert.equal(linkVisual(r, nodes, [g], 'w', 'g', 'a//w').kind, 'remove');
});
test('removal of ancestor is a dependency, not red individual descendant', () => {
  const nodes = fixture();
  nodes['s//w'].ghos = [g];
  const r = addReviewChange(
    emptyIntegratedReview(),
    nodes,
    [g],
    'w',
    'g',
    's//w',
    'REMOVE',
  );
  const v = linkVisual(r, nodes, [g], 'w', 'g', 'b//w');
  assert.equal(v.kind, 'inherited');
  assert.equal(v.dependency, true);
});
test('sector/subsector/directories can receive direct proposals', () => {
  const nodes = fixture();
  for (const id of ['s//w', 'sub//w']) {
    const r = addReviewChange(
      emptyIntegratedReview(),
      nodes,
      [g],
      'w',
      'g',
      id,
      'ADD',
    );
    assert.equal(linkVisual(r, nodes, [g], 'w', 'g', id).kind, 'add');
  }
});
test('accept/reject/reopen inclusion updates visuals without changing source', () => {
  const nodes = fixture(),
    before = JSON.stringify(nodes);
  let r = addReviewChange(
    emptyIntegratedReview(),
    nodes,
    [g],
    'w',
    'g',
    'b//w',
    'ADD',
  );
  const id = r.changes[0].id;
  r = decideReviewChange(r, id, 'accepted');
  assert.equal(
    linkVisual(r, nodes, [g], 'w', 'g', 'b//w').change?.decision,
    'accepted',
  );
  r = decideReviewChange(r, id, 'rejected');
  assert.equal(linkVisual(r, nodes, [g], 'w', 'g', 'b//w').kind, 'empty');
  r = decideReviewChange(r, id, 'pending');
  assert.equal(linkVisual(r, nodes, [g], 'w', 'g', 'b//w').kind, 'add');
  assert.equal(JSON.stringify(nodes), before);
});
test('rejecting removal restores green and neutral row, reopening restores red', () => {
  const nodes = fixture();
  let r = addReviewChange(
    emptyIntegratedReview(),
    nodes,
    [g],
    'w',
    'g',
    'a//w',
    'REMOVE',
  );
  const id = r.changes[0].id;
  r = decideReviewChange(r, id, 'rejected');
  assert.equal(linkVisual(r, nodes, [g], 'w', 'g', 'a//w').kind, 'existing');
  assert.equal(groupVisualState(r, 'g'), 'EXISTENTE_SEM_ALTERACOES');
  r = decideReviewChange(r, id, 'pending');
  assert.equal(linkVisual(r, nodes, [g], 'w', 'g', 'a//w').kind, 'remove');
});
test('creation decision independent from individual decisions and reversible', () => {
  const nodes = fixture();
  nodes['a//w'].ghos = [];
  let r = generateIntegratedReview(nodes, [g], 'c', 'w', '');
  const id = r.newGroups[0].id;
  r = decideCreation(r, id, 'accepted');
  assert.equal(r.changes[0].decision, 'pending');
  r = decideCreation(r, id, 'rejected');
  assert.equal(linkVisual(r, nodes, [g], 'w', id, 'a//w').kind, 'empty');
  r = decideCreation(r, id, 'pending');
  assert.equal(linkVisual(r, nodes, [g], 'w', id, 'a//w').kind, 'add');
});
test('creation cannot be accepted with no remaining composition', () => {
  assert.throws(() =>
    decideCreation(
      {
        newGroups: [{ id: 'tmp', name: 'N', decision: 'pending' }],
        changes: [],
      },
      'tmp',
      'accepted',
    ),
  );
});
test('foreign hierarchy/group and structural workspace are rejected', () => {
  const nodes = fixture();
  for (const [group, node] of [
    ['g', 'f//wf'],
    ['foreign', 'a//w'],
    ['g', 'w'],
  ])
    assert.throws(() =>
      addReviewChange(
        emptyIntegratedReview(),
        nodes,
        [g],
        'w',
        group,
        node,
        'ADD',
      ),
    );
});
test('existing group list strictly filtered, inactive/foreign rows excluded', () => {
  assert.equal(
    scopedExistingGroups(
      [
        g,
        { ...g, id: 'f', companyId: 'foreign' },
        { ...g, id: 'off', status: 'INACTIVE' } as IGho,
      ],
      'c',
      'w',
    ).length,
    1,
  );
});
test('scope identities separate same hierarchy shown in two establishments', () => {
  const nodes = fixture();
  nodes['b//wf'] = n('b//wf', T.OFFICE, 'wf');
  const r = addReviewChange(
    emptyIntegratedReview(),
    nodes,
    [g],
    'w',
    'g',
    'b//w',
    'ADD',
  );
  assert.equal(linkVisual(r, nodes, [g], 'w', 'g', 'b//wf').kind, 'empty');
});
test('empty data never manufactures sample proposals', () =>
  assert.deepEqual(
    generateIntegratedReview({}, [], 'c', 'w', '') as any,
    emptyIntegratedReview(),
  ));
test('cyclic parents cannot loop or expand outside workspace', () => {
  const nodes = fixture();
  nodes['s//w'].parentId = 'b//w';
  assert.equal(
    linkVisual(emptyIntegratedReview(), nodes, [g], 'w', 'g', 'b//w').kind,
    'empty',
  );
});
test('discarding review restores original links and contains no receipt/date mutation', () => {
  const nodes = fixture();
  const r = addReviewChange(
    emptyIntegratedReview(),
    nodes,
    [g],
    'w',
    'g',
    'a//w',
    'REMOVE',
  );
  assert.equal(
    linkVisual(emptyIntegratedReview(), nodes, [g], 'w', 'g', 'a//w').kind,
    'existing',
  );
  assert(!JSON.stringify(r).includes('endDate'));
});
test('required semantic colors fixed independently from theme', () => {
  assert.equal(REVIEW_COLORS.existing.color, '#2E7D5B');
  assert.equal(REVIEW_COLORS.add.color, '#3478C0');
  assert.equal(REVIEW_COLORS.remove.color, '#C44B4B');
  assert.notEqual(
    REVIEW_COLORS.newGroup.color,
    REVIEW_COLORS.changedGroup.color,
  );
});
test('rejecting a creation suspends accepted edges in the summary and reopen restores them', () => {
  const nodes = fixture();
  nodes['a//w'].ghos = [];
  let r = generateIntegratedReview(nodes, [g], 'c', 'w', '');
  const gid = r.newGroups[0].id;
  r = decideReviewChange(r, r.changes[0].id, 'accepted');
  r = decideCreation(r, gid, 'rejected');
  assert.equal(effectiveReviewChanges(r).length, 0);
  r = decideCreation(r, gid, 'pending');
  assert(effectiveReviewChanges(r).some((c) => c.decision === 'accepted'));
});
test('proposed ancestor inclusion shows prospective coverage, never a direct descendant link', () => {
  const nodes = fixture();
  let r = addReviewChange(
    emptyIntegratedReview(),
    nodes,
    [g],
    'w',
    'g',
    's//w',
    'ADD',
  );
  let v = linkVisual(r, nodes, [g], 'w', 'g', 'b//w');
  assert.equal(v.kind, 'inherited-add');
  assert.deepEqual(v.proposedSources, ['s//w']);
  assert.throws(() =>
    addReviewChange(r, nodes, [g], 'w', 'g', 'b//w', 'REMOVE'),
  );
  r = decideReviewChange(r, r.changes[0].id, 'rejected');
  assert.equal(linkVisual(r, nodes, [g], 'w', 'g', 'b//w').kind, 'empty');
});
test('navigation reveals collapsed ancestors and prioritizes suggested nodes without changing tree', () => {
  const nodes = fixture(),
    before = JSON.stringify(nodes);
  const review = generateIntegratedReview(nodes, [g], 'c', 'w', '');
  const route = reviewNavigation(nodes, review, 'w', 'g');
  assert.equal(route.targets[0], 'b//w');
  assert(route.targets.includes('a//w'));
  assert(route.ancestors.includes('s//w'));
  assert(route.ancestors.includes('w'));
  assert.equal(JSON.stringify(nodes), before);
  assert.deepEqual(reviewNavigation(nodes, review, 'wf', 'g').targets, []);
});
test('navigation cycles terminate and unrelated groups have no targets', () => {
  const nodes = fixture();
  nodes['s//w'].parentId = 'a//w';
  assert(
    reviewNavigation(nodes, emptyIntegratedReview(), 'w', 'g').ancestors
      .length < 4,
  );
  assert.deepEqual(
    reviewNavigation(nodes, emptyIntegratedReview(), 'w', 'missing').targets,
    [],
  );
});
test('positioning avoids right panel, frames nearby nodes, falls back to first distant region', () => {
  let result: any;
  const container = {
    offsetWidth: 1000,
    scrollLeft: 100,
    scrollTop: 100,
    getBoundingClientRect: () => ({
      left: 0,
      right: 1000,
      top: 0,
      bottom: 700,
      width: 1000,
      height: 700,
    }),
    scrollTo: (value: any) => {
      result = value;
    },
  } as unknown as HTMLElement;
  const element = (left: number, top: number) =>
    ({
      getBoundingClientRect: () => ({
        left,
        right: left + 100,
        top,
        bottom: top + 40,
      }),
    }) as HTMLElement;
  const panel = {
    getBoundingClientRect: () => ({
      left: 700,
      right: 1000,
      top: 100,
      bottom: 600,
    }),
  } as HTMLElement;
  focusReviewRegion(container, [element(800, 300), element(920, 350)], panel);
  assert(result.left > 500);
  assert.equal(result.behavior, 'auto');
  const centralPanel = {
    getBoundingClientRect: () => ({
      left: 490,
      right: 950,
      top: 100,
      bottom: 600,
    }),
  } as HTMLElement;
  focusReviewRegion(container, [element(800, 300)], centralPanel);
  assert(
    result.left > 500,
    'choose larger free left region even when panel starts before midpoint',
  );
  focusReviewRegion(container, [element(800, 300), element(2000, 1700)], panel);
  assert.equal(result.top, 70);
});
test('floating panel clamps dragging and resize to visible bounds', () => {
  assert.deepEqual(clampPanelPosition(-500, -500, 370, 500, 1280, 800), {
    x: 80,
    y: 100,
  });
  assert.deepEqual(clampPanelPosition(5000, 5000, 370, 500, 1280, 800), {
    x: 902,
    y: 292,
  });
});

test('fresh analysis after closing or refresh reuses receipt identity, independently of the name', () => {
  const nodes = fixture();
  nodes['a//w'].ghos = [];
  const renamed = { ...g, name: 'Nome editado pelo usuário' };
  const identity = {
    companyId: 'c',
    workspaceId: 'w',
    entries: [{ temporaryId: '@visual-gse:s//w', groupId: 'g' }],
  };
  for (let reload = 0; reload < 2; reload++) {
    const review = generateIntegratedReview(
      structuredClone(nodes),
      [renamed],
      'c',
      'w',
      '',
      JSON.parse(JSON.stringify(identity)),
    );
    assert.equal(review.newGroups.length, 0);
    assert.equal(review.changes.filter((c) => c.groupId === 'g').length, 2);
    assert.equal(groupVisualState(review, 'g'), 'EXISTENTE_COM_ALTERACOES');
  }
});
test('partially applied links remain amber and fully covered links become gray', () => {
  const nodes = fixture();
  const identity = {
    companyId: 'c',
    workspaceId: 'w',
    entries: [{ temporaryId: '@visual-gse:s//w', groupId: 'g' }],
  };
  let review = generateIntegratedReview(nodes, [g], 'c', 'w', '', identity);
  assert.deepEqual(
    review.changes.filter((c) => c.kind === 'ADD').map((c) => c.nodeId),
    ['b//w'],
  );
  nodes['b//w'].ghos = [g];
  review = generateIntegratedReview(nodes, [g], 'c', 'w', '', identity);
  assert.equal(review.changes.length, 0);
  assert.equal(groupVisualState(review, 'g'), 'EXISTENTE_SEM_ALTERACOES');
  nodes['a//w'].ghos = [];
  nodes['b//w'].ghos = [];
  nodes['s//w'].ghos = [g];
  assert.equal(
    generateIntegratedReview(nodes, [g], 'c', 'w', '', identity).changes.length,
    0,
  );
});
test('receipt identity has priority over another structurally related group', () => {
  const nodes = fixture();
  const other = { ...g, id: 'other' };
  const identity = {
    companyId: 'c',
    workspaceId: 'w',
    entries: [{ temporaryId: '@visual-gse:s//w', groupId: 'other' }],
  };
  assert.ok(
    generateIntegratedReview(
      nodes,
      [g, other],
      'c',
      'w',
      '',
      identity,
    ).changes.every((c) => c.groupId === 'other'),
  );
});
test('same name alone does not merge groups and ambiguous proven identities refuse analysis', () => {
  const nodes = fixture();
  nodes['a//w'].ghos = [];
  const sameName = { ...g, name: 'GSE — s//w' };
  assert.equal(
    generateIntegratedReview(nodes, [sameName], 'c', 'w', '').newGroups.length,
    1,
  );
  const other = { ...sameName, id: 'other' };
  assert.throws(
    () =>
      generateIntegratedReview(nodes, [sameName, other], 'c', 'w', '', {
        companyId: 'c',
        workspaceId: 'w',
        entries: ['g', 'other'].map((groupId) => ({
          temporaryId: '@visual-gse:s//w',
          groupId,
        })),
      }),
    /mais de um GSE/,
  );
});
test('foreign, deleted, inactive and HIERARCHY identities are never reused', () => {
  const nodes = fixture();
  nodes['a//w'].ghos = [];
  const identity = {
    companyId: 'c',
    workspaceId: 'w',
    entries: [{ temporaryId: '@visual-gse:s//w', groupId: 'g' }],
  };
  for (const patch of [
    { companyId: 'foreign' },
    { workspaceIds: ['other'] },
    { status: 'INACTIVE' },
    { deletedAt: '2026-10-31' },
    { type: 'HIERARCHY' },
  ]) {
    assert.equal(
      generateIntegratedReview(
        nodes,
        [{ ...g, ...patch } as IGho],
        'c',
        'w',
        '',
        identity,
      ).newGroups.length,
      1,
    );
  }
  for (const patch of [{ companyId: 'foreign' }, { workspaceId: 'foreign' }])
    assert.equal(
      generateIntegratedReview(nodes, [g], 'c', 'w', '', {
        ...identity,
        ...patch,
      }).newGroups.length,
      1,
    );
});

test('actual save reconciliation preserves proposals through purple/amber/gray transitions', () => {
  const nodes = fixture();
  nodes['a//w'].ghos = [];
  const original = generateIntegratedReview(nodes, [], 'c', 'w', '');
  const temporaryId = original.newGroups[0].id;
  assert.equal(groupVisualState(original, temporaryId), 'NOVO_SUGERIDO');
  const request: any = { commands: [{ kind: 'CREATE_GSE', temporaryId }] };
  const result: any = { createdGroups: [{ temporaryId, id: 'g' }] };
  const created = reconcileSavedReview(original, request, result);
  assert.equal(created.newGroups.length, 0);
  assert.equal(created.changes.length, 2);
  assert.ok(
    created.changes.every((c) => c.groupId === 'g' && c.decision === 'pending'),
  );
  assert.equal(groupVisualState(created, 'g'), 'EXISTENTE_COM_ALTERACOES');
  const partial = reconcileSavedReview(
    original,
    {
      commands: [
        ...request.commands,
        {
          kind: 'ADD_LINK',
          group: { kind: 'TEMPORARY', temporaryId },
          hierarchyId: 'a',
        },
      ],
    } as any,
    result,
  );
  assert.deepEqual(
    partial.changes.map((c) => c.nodeId),
    ['b//w'],
  );
  assert.equal(groupVisualState(partial, 'g'), 'EXISTENTE_COM_ALTERACOES');
  const complete = reconcileSavedReview(
    partial,
    {
      commands: [
        {
          kind: 'ADD_LINK',
          group: { kind: 'EXISTING', id: 'g' },
          hierarchyId: 'b',
        },
      ],
    } as any,
    { createdGroups: [] } as any,
  );
  assert.equal(groupVisualState(complete, 'g'), 'EXISTENTE_SEM_ALTERACOES');
});
console.log(`${count} integrated model tests passed.`);
