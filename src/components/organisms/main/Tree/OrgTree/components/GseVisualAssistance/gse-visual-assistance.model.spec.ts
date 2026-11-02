import assert from 'node:assert/strict';
import { TreeTypeEnum as T } from '../../enums/tree-type.enums';
import type { ITreeMap, ITreeMapObject } from '../../interfaces';
import type { IGho } from 'core/interfaces/api/IGho';
import {
  analyzeVisualGseScope as analyze,
  reviseVisualProposal as revise,
  visualScopeSignature,
  ASSISTANCE_STATES,
} from './gse-visual-assistance.model';

let checks = 0;
const test = (name: string, fn: () => void) => {
  fn();
  checks++;
  console.log('PASS', name);
};
const node = (
  id: string,
  type: T,
  parentId: string | null,
  label = id,
): ITreeMapObject => ({
  id,
  type,
  parentId,
  label,
  childrenIds: [],
  expand: false,
  ghos: [],
});
const group = {
  id: 'g1',
  name: 'GSE existente',
  companyId: 'c',
  status: 'ACTIVE',
  workspaceIds: ['w'],
} as IGho;
const fixture = (): ITreeMap => ({
  w: node('w', T.WORKSPACE, null),
  's//w': node('s//w', T.SECTOR, 'w', 'Manutenção'),
  'a//w': node('a//w', T.OFFICE, 's//w', 'Eletricista'),
  'b//w': node('b//w', T.OFFICE, 's//w', 'Mecânico'),
  wf: node('wf', T.WORKSPACE, null),
  'f//wf': node('f//wf', T.OFFICE, 'wf', 'Eletricista'),
});
test('actual structural candidates use only selected workspace and preserve source', () => {
  const nodes = fixture(),
    before = JSON.stringify(nodes),
    a = analyze(nodes, 'c', 'w', 'Separar eletricistas');
  assert.equal(a.proposals.length, 1);
  assert.deepEqual(a.proposals[0].roleIds, ['a//w', 'b//w']);
  assert.equal(a.guidance, 'Separar eletricistas');
  assert.match(a.proposals[0].reason, /sem evidência suficiente/);
  assert.equal(JSON.stringify(nodes), before);
});
test('guidance is retained honestly without changing deterministic composition', () => {
  const n = fixture();
  assert.deepEqual(
    analyze(n, 'c', 'w', 'x').proposals,
    analyze(n, 'c', 'w', 'Separar eletricistas').proposals,
  );
});
test('same names in different sector identities never merge', () => {
  const n = fixture();
  n['s2//w'] = node('s2//w', T.SECTOR, 'w', 'Manutenção');
  n['x//w'] = node('x//w', T.OFFICE, 's2//w', 'Eletricista');
  assert.equal(analyze(n, 'c', 'w', '').proposals.length, 2);
});
test('names alone do not merge roles without sector evidence', () => {
  const n = fixture();
  n['a//w'].parentId = 'w';
  n['b//w'].parentId = 'w';
  n['b//w'].label = 'Eletricista';
  assert.equal(analyze(n, 'c', 'w', '').proposals.length, 2);
});
test('existing direct link is displayed and not suggested twice', () => {
  const n = fixture();
  n['a//w'].ghos = [group];
  const a = analyze(n, 'c', 'w', '');
  assert.deepEqual(a.roles[0].existingIds, ['g1']);
  assert.deepEqual(a.proposals[0].roleIds, ['b//w']);
  assert.equal(a.proposals[0].targetId, 'g1');
});
test('inherited structural coverage is distinguished from direct occupation', () => {
  const n = fixture();
  n['s//w'].ghos = [group];
  const a = analyze(n, 'c', 'w', '');
  assert.equal(a.proposals.length, 0);
  assert.deepEqual(a.roles[0].existingIds, []);
  assert.deepEqual(a.roles[0].inheritedIds, ['g1']);
});
test('foreign/deleted/non-GSE targets cannot be reused', () => {
  for (const bad of [
    { companyId: 'foreign' },
    { workspaceIds: ['wf'] },
    { status: 'INACTIVE' },
    { type: 'ENVIRONMENT' },
  ]) {
    const n = fixture();
    n['a//w'].ghos = [{ ...group, ...bad } as IGho];
    const a = analyze(n, 'c', 'w', '');
    assert.equal(a.groups.length, 0);
    assert.equal(a.proposals[0].targetId, null);
  }
});
test('workspace encoded in tree identity wins over misleading parent', () => {
  const n = fixture();
  n['f//wf'].parentId = 's//w';
  assert(!analyze(n, 'c', 'w', '').roles.some((r) => r.id === 'f//wf'));
});
test('reference nodes excluded', () => {
  const n = fixture();
  n['a//w'].showRef = true;
  assert.equal(analyze(n, 'c', 'w', '').roles.length, 1);
});
test('empty/missing workspace never fabricates sample suggestions', () => {
  assert.equal(analyze({}, 'c', 'w', '').proposals.length, 0);
  assert.equal(analyze(fixture(), 'c', '', '').roles.length, 0);
});
test('malformed cyclic tree cannot loop forever', () => {
  const n = fixture();
  n['s//w'].parentId = 'a//w';
  assert.equal(analyze(n, 'c', 'w', '').roles.length, 2);
});
test('accept/reject/reopen are immutable local states', () => {
  const a = analyze(fixture(), 'c', 'w', ''),
    id = a.proposals[0].id;
  const accepted = revise(a, id, { state: 'accepted' });
  assert.equal(a.proposals[0].state, 'pending');
  assert.equal(accepted.proposals[0].state, 'accepted');
  assert.equal(
    revise(accepted, id, { state: 'rejected' }).proposals[0].state,
    'rejected',
  );
  assert.equal(
    revise(accepted, id, { state: 'pending' }).proposals[0].state,
    'pending',
  );
});
test('editing accepted composition requires acceptance again', () => {
  const a = analyze(fixture(), 'c', 'w', ''),
    id = a.proposals[0].id,
    accepted = revise(a, id, { state: 'accepted' });
  for (const patch of [
    { name: 'Outro' },
    { roleIds: ['a//w'] },
    { targetId: null },
  ])
    assert.equal(revise(accepted, id, patch).proposals[0].state, 'pending');
});
test('foreign role or target rejected even during local revision', () => {
  const a = analyze(fixture(), 'c', 'w', ''),
    id = a.proposals[0].id;
  assert.throws(
    () => revise(a, id, { roleIds: ['f//wf'] }),
    /fora do estabelecimento/,
  );
  assert.throws(
    () => revise(a, id, { targetId: 'foreign' }),
    /fora do estabelecimento/,
  );
});
test('cannot accept empty composition/name', () => {
  let a = analyze(fixture(), 'c', 'w', ''),
    id = a.proposals[0].id;
  a = revise(a, id, { roleIds: [] });
  assert.throws(() => revise(a, id, { state: 'accepted' }));
  a = revise(a, id, { roleIds: ['a//w'], name: ' ' });
  assert.throws(() => revise(a, id, { state: 'accepted' }));
});
test('reusing destination never renames the existing group', () => {
  const n = fixture();
  n['a//w'].ghos = [group];
  let a = analyze(n, 'c', 'w', ''),
    id = a.proposals[0].id;
  a = revise(a, id, { name: 'Nome novo' });
  a = revise(a, id, { state: 'accepted' });
  assert.equal(a.groups[0].name, 'GSE existente');
  assert.equal(a.proposals[0].targetId, 'g1');
});
test('zoom/expansion/search changes preserve signature, resource changes invalidate', () => {
  const n = fixture(),
    before = visualScopeSignature(n, 'c', 'w');
  n['a//w'].expand = true;
  n['a//w'].hide = true;
  n['a//w'].search = 'busca';
  assert.equal(visualScopeSignature(n, 'c', 'w'), before);
  n['a//w'].label = 'Mudou';
  assert.notEqual(visualScopeSignature(n, 'c', 'w'), before);
});
test('new link invalidates a review', () => {
  const n = fixture(),
    before = visualScopeSignature(n, 'c', 'w');
  n['a//w'].ghos = [group];
  assert.notEqual(visualScopeSignature(n, 'c', 'w'), before);
});
test('semantic state colors are fixed, unique, with readable labels', () => {
  assert.equal(
    new Set(Object.values(ASSISTANCE_STATES).map((s) => s.color)).size,
    5,
  );
  for (const state of Object.values(ASSISTANCE_STATES)) {
    assert.match(state.color, /^#[0-9A-F]{6}$/);
    assert(state.label.length > 5);
  }
});
console.log(`${checks} model tests passed; no persistence or network.`);
