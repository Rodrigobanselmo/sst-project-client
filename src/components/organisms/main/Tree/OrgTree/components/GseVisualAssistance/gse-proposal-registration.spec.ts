import assert from 'node:assert/strict';
import type { IGho } from 'core/interfaces/api/IGho';
import type { ITreeMap } from '../../interfaces';
import { TreeTypeEnum as T } from '../../enums/tree-type.enums';
import {
  suggestGseName,
  describeGseProposal,
} from './gse-proposal-registration';
import {
  generateIntegratedReview,
  editProposedGse,
  decideCreation,
  groupVisualState,
} from './gse-integrated-review.model';
import { summarizeApprovedGseAdditions } from './gse-approved-additions';
import { approvedSaveRequest, reconcileSavedReview } from './gse-additive-save';
const group = (name: string, id = name, patch = {}) =>
  ({
    id,
    name,
    companyId: 'c',
    workspaceIds: ['w'],
    status: 'ACTIVE',
    type: null,
    description: 'Descrição existente',
    ...patch,
  }) as unknown as IGho;
const compac = [
  group('GSE COMPAC (Filial) 01 — ADMINISTRAÇÃO'),
  group('GSE COMPAC (Filial) — FISCALIZAÇÃO OPERACIONAL'),
  group('GSE COMPAC (Filial) — VARRIÇÃO E LIMPEZA'),
];
const nodes = {
  w: {
    id: 'w',
    type: T.WORKSPACE,
    label: 'FILIAL',
    childrenIds: [],
    parentId: null,
  },
  's//w': {
    id: 's//w',
    type: T.SECTOR,
    label: 'OPERAÇÃO DE VARREDEIRA MECANIZADA',
    parentId: 'w',
    childrenIds: [],
  },
  'a//w': {
    id: 'a//w',
    type: T.OFFICE,
    label: 'AUXILIAR DE OPERAÇÃO',
    parentId: 's//w',
    childrenIds: [],
  },
  'b//w': {
    id: 'b//w',
    type: T.OFFICE,
    label: 'OPERADOR',
    parentId: 's//w',
    childrenIds: [],
  },
} as unknown as ITreeMap;
const registration = {
  companyName: 'COMPAC ENGENHARIA LTDA.',
  workspaceName: 'FILIAL',
};
const analyze = (
  groups = compac,
  previous?: ReturnType<typeof generateIntegratedReview>,
) =>
  generateIntegratedReview(nodes, groups, 'c', 'w', '', null, {
    ...registration,
    previous,
  });
const summary = (review: ReturnType<typeof analyze>) =>
  summarizeApprovedGseAdditions({
    companyId: 'c',
    workspaceId: 'w',
    nodes,
    groups: compac,
    stale: false,
    review,
  });
let count = 0;
const test = (name: string, fn: () => void) => {
  fn();
  count++;
  console.log('PASS', name);
};
test('COMPAC mixed numbering supplies prefix without inventing a sequence', () => {
  const review = analyze();
  assert.equal(
    review.newGroups[0].name,
    'GSE COMPAC (Filial) — OPERAÇÃO DE VARREDEIRA MECANIZADA',
  );
  assert.equal(suggestGseName('NOVO', compac), 'GSE COMPAC (Filial) — NOVO');
});
test('consistent sequence reserves the next position across proposals and avoids collisions', () => {
  const groups = [
    group('GSE Empresa (Filial) 01 - A'),
    group('GSE Empresa (Filial) 02 - B'),
  ];
  assert.equal(suggestGseName('C', groups), 'GSE Empresa (Filial) 03 - C');
  assert.equal(
    suggestGseName('D', groups, ['GSE Empresa (Filial) 03 - C']),
    'GSE Empresa (Filial) 04 - D',
  );
});
test('unpadded consecutive numbering remains valid across digit boundaries', () => {
  assert.equal(
    suggestGseName('C', [
      group('GSE Empresa 9 — A'),
      group('GSE Empresa 10 — B'),
    ]),
    'GSE Empresa 11 — C',
  );
});
test('inconsistent or missing numeric evidence never imposes numbering', () => {
  assert.equal(
    suggestGseName('C', [
      group('GSE Empresa 01 — A'),
      group('GSE Empresa 03 — B'),
    ]),
    'GSE Empresa — C',
  );
  assert.equal(suggestGseName('C', [group('GSE Empresa 01 — A')]), 'GSE — C');
});
test('conflicting or insufficient patterns fall back conservatively', () => {
  assert.equal(
    suggestGseName('C', [group('GSE A — A'), group('GSE B — B')]),
    'GSE — C',
  );
  assert.equal(suggestGseName('C', []), 'GSE — C');
  assert.equal(
    suggestGseName('C', [group('Grupo comercial'), group('Outro')]),
    'GSE — C',
  );
});
test('registration considers only active operational groups from selected company/workspace', () => {
  const invalid = [
    group('GSE OUTRA — A', '1', { companyId: 'other' }),
    group('GSE OUTRA — B', '2', { workspaceIds: ['other'] }),
    group('GSE OUTRA — C', '3', { type: 'HIERARCHY' }),
    group('GSE OUTRA — D', '4', { status: 'INACTIVE' }),
  ];
  assert.equal(
    analyze([...compac, ...invalid]).newGroups[0].name,
    'GSE COMPAC (Filial) — OPERAÇÃO DE VARREDEIRA MECANIZADA',
  );
  assert.equal(
    analyze(invalid).newGroups[0].name,
    'GSE — OPERAÇÃO DE VARREDEIRA MECANIZADA',
  );
});
test('description states proposal context and candidate roles without asserting effective associations', () => {
  const text = analyze().newGroups[0].description!;
  for (const value of [
    'COMPAC ENGENHARIA LTDA.',
    'FILIAL',
    'OPERAÇÃO DE VARREDEIRA MECANIZADA',
    'AUXILIAR DE OPERAÇÃO',
    'OPERADOR',
    'Cargos considerados na proposta',
    'não representam, por si só, vínculos efetivamente cadastrados',
    'depende de validação técnica',
  ])
    assert.ok(text.includes(value));
  assert.ok(!/ruído|poeira|vibração|equipamento/i.test(text));
});
test('description stays within existing 2000-character contract for large proposals', () => {
  const text = describeGseProposal({
    company: 'Empresa',
    workspace: 'Filial',
    sector: 'Setor',
    roles: Array.from(
      { length: 200 },
      (_, i) => `Cargo ${i} ${'X'.repeat(150)}`,
    ),
  });
  assert.ok(text.length <= 2000);
  assert.ok(text.includes('não enumerados neste resumo'));
  assert.ok(text.endsWith('cadastrados.'));
});
test('create-only payload carries the suggested description without any link command', () => {
  const review = analyze();
  const approved = decideCreation(review, review.newGroups[0].id, 'accepted');
  const request = approvedSaveRequest(
    summary(approved),
    'w',
    'registration-test-123456',
  );
  assert.equal(request.commands.length, 1);
  assert.equal(
    (request.commands[0] as any).description,
    review.newGroups[0].description,
  );
});
test('approved links do not rewrite the approved registration description', () => {
  const review = analyze();
  const approved = decideCreation(review, review.newGroups[0].id, 'accepted');
  approved.changes = approved.changes.map((c) => ({
    ...c,
    decision: 'accepted',
  }));
  const request = approvedSaveRequest(
    summary(approved),
    'w',
    'registration-test-123456',
  );
  assert.equal(request.commands.filter((c) => c.kind === 'ADD_LINK').length, 2);
  assert.equal(
    (request.commands[0] as any).description,
    review.newGroups[0].description,
  );
});
test('edited description is transported verbatim, including intentional whitespace and line breaks', () => {
  const review = analyze();
  const id = review.newGroups[0].id;
  const description =
    '  Texto aprovado pelo responsável técnico.\nSegunda linha.  ';
  const edited = editProposedGse(review, id, {
    name: 'Nome revisado',
    description,
  });
  const approved = decideCreation(edited, id, 'accepted');
  const request = approvedSaveRequest(
    summary(approved),
    'w',
    'registration-test-123456',
  );
  assert.equal((request.commands[0] as any).description, description);
  assert.equal(request.commands[0].kind, 'CREATE_GSE');
  assert.equal((request.commands[0] as any).name, 'Nome revisado');
  const again = analyze(compac, approved);
  assert.equal(again.newGroups[0].description, description);
  assert.equal(again.newGroups[0].name, 'Nome revisado');
  assert.equal(
    editProposedGse(approved, id, { description: 'Revisão adicional' })
      .newGroups[0].decision,
    'pending',
  );
});
test('reanalysis preserves edits before approval and preserves approved names without editing existing GSEs', () => {
  const before = JSON.stringify(compac);
  const review = analyze();
  const id = review.newGroups[0].id;
  const edited = editProposedGse(review, id, {
    name: 'Nome livre',
    description: 'Minha descrição',
  });
  assert.equal(
    analyze(compac, edited).newGroups[0].description,
    'Minha descrição',
  );
  const approved = decideCreation(review, id, 'accepted');
  assert.equal(
    analyze(
      [
        ...compac,
        group('GSE NOVO — A'),
        group('GSE NOVO — B'),
        group('GSE NOVO — C'),
        group('GSE NOVO — D'),
      ],
      approved,
    ).newGroups[0].name,
    approved.newGroups[0].name,
  );
  assert.equal(JSON.stringify(compac), before);
});
test('existing group receives only links and its persisted name/description are preserved', () => {
  const existing = group('Nome existente', 'real');
  const before = JSON.stringify(existing);
  const review = generateIntegratedReview(
    nodes,
    [existing],
    'c',
    'w',
    '',
    {
      companyId: 'c',
      workspaceId: 'w',
      entries: [{ temporaryId: '@visual-gse:s//w', groupId: 'real' }],
    },
    registration,
  );
  assert.equal(review.newGroups.length, 0);
  review.changes = review.changes.map((c) => ({ ...c, decision: 'accepted' }));
  const approved = summarizeApprovedGseAdditions({
    companyId: 'c',
    workspaceId: 'w',
    nodes,
    groups: [existing],
    stale: false,
    review,
  });
  assert.ok(
    approvedSaveRequest(
      approved,
      'w',
      'registration-test-123456',
    ).commands.every((c) => c.kind === 'ADD_LINK'),
  );
  assert.equal(JSON.stringify(existing), before);
});
test('registration fields do not regress create-only save reconciliation', () => {
  const review = analyze();
  const approved = decideCreation(review, review.newGroups[0].id, 'accepted');
  const request = approvedSaveRequest(
    summary(approved),
    'w',
    'registration-test-123456',
  );
  const reconciled = reconcileSavedReview(approved, request, {
    createdGroups: [{ temporaryId: review.newGroups[0].id, id: 'real' }],
  } as any);
  assert.equal(reconciled.newGroups.length, 0);
  assert.equal(reconciled.changes.length, 2);
  assert.equal(
    groupVisualState(reconciled, 'real'),
    'EXISTENTE_COM_ALTERACOES',
  );
});
test('oversized edited descriptions are refused before any request', () => {
  const review = analyze();
  const id = review.newGroups[0].id;
  const approved = decideCreation(
    editProposedGse(review, id, { description: 'x'.repeat(2001) }),
    id,
    'accepted',
  );
  const value = summary(approved);
  assert.equal(value.applicable, false);
  assert.ok(value.issues.some((i) => i.includes('2000')));
  assert.throws(() =>
    approvedSaveRequest(value, 'w', 'registration-test-123456'),
  );
});
console.log(`${count} registration tests passed.`);
