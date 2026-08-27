/**
 * Runnable with:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' \
 *     -r tsconfig-paths/register \
 *     src/components/organisms/documentModel/section-propagation/section-propagation-list.spec.ts
 */
import assert from 'assert';

import {
  DocumentModelClassificationEnum,
  toggleDocumentModelClassificationFilter,
} from 'project/enum/document-model-classification.enum';
import { StatusEnum } from 'project/enum/status.enum';

import {
  SectionPropagationCandidate,
  SectionPropagationUiStatus,
} from './section-propagation.types';
import {
  filterSectionPropagationCandidates,
  groupSectionPropagationCandidates,
  sectionPropagationGroup,
  sectionPropagationNameColor,
  sectionPropagationStatusColor,
} from './section-propagation-list';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

function candidate(
  partial: Partial<SectionPropagationCandidate> & { id: number; name: string },
): SectionPropagationCandidate {
  return {
    status: StatusEnum.ACTIVE,
    system: false,
    classifications: [],
    updated_at: '2026-08-27T19:00:00.000Z',
    dataHash: null,
    matchClass: partial.selectable ? 'A' : 'B',
    uiStatus: 'structure',
    uiLabel: 'x',
    selectable: false,
    alreadyUpToDate: false,
    oldVersionCompatible: false,
    preview: { current: [], next: [], currentCount: 0, nextCount: 0 },
    ...partial,
  };
}

const all: SectionPropagationCandidate[] = [
  candidate({
    id: 2,
    name: 'Zeta Completo Terceiros',
    classifications: [
      DocumentModelClassificationEnum.COMPLETO,
      DocumentModelClassificationEnum.TERCEIROS,
      DocumentModelClassificationEnum.COM_FRPS,
    ],
    selectable: true,
    uiStatus: 'compatible',
    matchClass: 'A',
  }),
  candidate({
    id: 3,
    name: 'Alfa Completo',
    classifications: [DocumentModelClassificationEnum.COMPLETO],
    selectable: true,
    uiStatus: 'old_version_compatible',
    oldVersionCompatible: true,
    matchClass: 'A',
  }),
  candidate({
    id: 4,
    name: 'Beta já atualizado',
    classifications: [DocumentModelClassificationEnum.COMPLETO, DocumentModelClassificationEnum.TERCEIROS],
    alreadyUpToDate: true,
    uiStatus: 'already_up_to_date',
    matchClass: 'A',
  }),
  candidate({
    id: 5,
    name: 'Gama exclusivo',
    classifications: [DocumentModelClassificationEnum.COMPLETO],
    uiStatus: 'extra_content',
    matchClass: 'B',
  }),
  candidate({
    id: 6,
    name: 'Delta não encontrado',
    classifications: [DocumentModelClassificationEnum.SIMPLIFICADO],
    uiStatus: 'not_found',
    matchClass: 'F',
  }),
  candidate({
    id: 7,
    name: 'Epsilon Sem FRPS',
    classifications: [DocumentModelClassificationEnum.SEM_FRPS, DocumentModelClassificationEnum.COMPLETO],
    selectable: true,
    uiStatus: 'compatible',
    matchClass: 'A',
  }),
];

run('1. sem filtro → todos os candidatos da análise aparecem', () => {
  assert.equal(filterSectionPropagationCandidates(all, []).length, all.length);
});

run('2. Completo → somente modelos com Complete', () => {
  const filtered = filterSectionPropagationCandidates(all, [
    DocumentModelClassificationEnum.COMPLETO,
  ]);
  assert.deepStrictEqual(
    filtered.map((item) => item.id).sort(),
    [2, 3, 4, 5, 7],
  );
  assert.equal(filtered.some((item) => item.id === 6), false);
});

run('3. Completo + Terceiros → AND', () => {
  const filtered = filterSectionPropagationCandidates(all, [
    DocumentModelClassificationEnum.COMPLETO,
    DocumentModelClassificationEnum.TERCEIROS,
  ]);
  assert.deepStrictEqual(
    filtered.map((item) => item.id).sort(),
    [2, 4],
  );
});

run('4. Com FRPS → filtra', () => {
  const filtered = filterSectionPropagationCandidates(all, [
    DocumentModelClassificationEnum.COM_FRPS,
  ]);
  assert.deepStrictEqual(filtered.map((item) => item.id), [2]);
});

run('5. Sem FRPS troca Com FRPS pelo toggle excludente', () => {
  const next = toggleDocumentModelClassificationFilter(
    [DocumentModelClassificationEnum.COM_FRPS],
    DocumentModelClassificationEnum.SEM_FRPS,
  );
  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.SEM_FRPS]);
  const filtered = filterSectionPropagationCandidates(all, next);
  assert.deepStrictEqual(filtered.map((item) => item.id), [7]);
});

run('6. Próprio ↔ Terceiros', () => {
  const next = toggleDocumentModelClassificationFilter(
    [DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO],
    DocumentModelClassificationEnum.TERCEIROS,
  );
  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.TERCEIROS]);
});

run('7. Simplificado ↔ Completo', () => {
  const next = toggleDocumentModelClassificationFilter(
    [DocumentModelClassificationEnum.SIMPLIFICADO],
    DocumentModelClassificationEnum.COMPLETO,
  );
  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.COMPLETO]);
});

run('8. Com Visita ↔ Dados Fornecidos', () => {
  const next = toggleDocumentModelClassificationFilter(
    [DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO],
    DocumentModelClassificationEnum.DADOS_FORNECIDOS,
  );
  assert.deepStrictEqual(next, [DocumentModelClassificationEnum.DADOS_FORNECIDOS]);
});

run('9. Limpar filtros restaura a lista completa', () => {
  const filtered = filterSectionPropagationCandidates(all, [
    DocumentModelClassificationEnum.COMPLETO,
  ]);
  assert.ok(filtered.length < all.length);
  assert.equal(filterSectionPropagationCandidates(filtered.length ? all : [], []).length, all.length);
});

run('10. contadores recalculados na lista filtrada', () => {
  const filtered = filterSectionPropagationCandidates(all, [
    DocumentModelClassificationEnum.COMPLETO,
    DocumentModelClassificationEnum.TERCEIROS,
  ]);
  const groups = groupSectionPropagationCandidates(filtered);
  assert.deepStrictEqual(
    Object.fromEntries(groups.map((group) => [group.id, group.count])),
    {
      linked: 0,
      applicable: 1,
      already_up_to_date: 1,
      manual_review: 0,
      not_found: 0,
    },
  );
});

run('11. filtros não alteram selectable nem o status da API', () => {
  const snapshot = all.map((item) => ({
    id: item.id,
    selectable: item.selectable,
    uiStatus: item.uiStatus,
  }));
  filterSectionPropagationCandidates(all, [DocumentModelClassificationEnum.COMPLETO]);
  assert.deepStrictEqual(
    all.map((item) => ({ id: item.id, selectable: item.selectable, uiStatus: item.uiStatus })),
    snapshot,
  );
  const filtered = filterSectionPropagationCandidates(all, [
    DocumentModelClassificationEnum.COMPLETO,
  ]);
  assert.equal(filtered.find((item) => item.id === 5)?.selectable, false);
  assert.equal(filtered.find((item) => item.id === 5)?.uiStatus, 'extra_content');
  assert.equal(filtered.find((item) => item.id === 3)?.selectable, true);
});

run('12. modelo bloqueado continua bloqueado mesmo filtrado e depois de limpar', () => {
  const filtered = filterSectionPropagationCandidates(all, [
    DocumentModelClassificationEnum.COMPLETO,
  ]);
  const blocked = filtered.find((item) => item.id === 5)!;
  assert.equal(sectionPropagationGroup(blocked), 'manual_review');
  assert.equal(blocked.selectable, false);
  const restored = filterSectionPropagationCandidates(all, []);
  const unsafeAgain = restored.find((item) => item.id === 5)!;
  assert.equal(unsafeAgain.uiStatus, 'extra_content');
  assert.equal(unsafeAgain.selectable, false);
  assert.equal(sectionPropagationGroup(unsafeAgain), 'manual_review');
});

run('Completo esconde Simplificado; Terceiros reduz; limpar restaura', () => {
  const completo = filterSectionPropagationCandidates(all, [
    DocumentModelClassificationEnum.COMPLETO,
  ]);
  assert.equal(completo.some((item) => item.classifications.includes(DocumentModelClassificationEnum.SIMPLIFICADO)), false);
  const terceiros = filterSectionPropagationCandidates(all, [
    DocumentModelClassificationEnum.TERCEIROS,
  ]);
  assert.ok(terceiros.length < all.length);
  assert.equal(filterSectionPropagationCandidates(all, []).length, all.length);
});

run('UX sort: Vinculados → Compatíveis → Já atualizados → Revisão manual → Não encontrados', () => {
  const groups = groupSectionPropagationCandidates(all);
  assert.deepStrictEqual(
    groups.map((group) => group.id),
    ['linked', 'applicable', 'already_up_to_date', 'manual_review', 'not_found'],
  );
  assert.deepStrictEqual(
    groups[1].candidates.map((item) => item.name),
    ['Alfa Completo', 'Epsilon Sem FRPS', 'Zeta Completo Terceiros'],
  );
  assert.equal(groups[4].candidates[0].uiStatus, 'not_found');
});

run('vinculados aplicáveis ficam no primeiro grupo', () => {
  const linkedRow = candidate({
    id: 8,
    name: 'Omega vinculado',
    selectable: true,
    linked: true,
    memberValid: true,
    uiStatus: 'old_version_compatible',
    matchClass: 'A',
  });
  const groups = groupSectionPropagationCandidates([...all, linkedRow]);
  assert.equal(sectionPropagationGroup(linkedRow), 'linked');
  assert.equal(groups[0].candidates[0].id, 8);
  const broken = candidate({
    id: 9,
    name: 'Quebrado',
    linked: true,
    memberValid: false,
    uiStatus: 'broken',
    matchClass: 'F',
  });
  assert.equal(sectionPropagationGroup(broken), 'manual_review');
});

run('Seção não encontrada: status vermelho e nome disabled/cinza', () => {
  assert.equal(sectionPropagationStatusColor('not_found'), 'error.main');
  assert.equal(sectionPropagationNameColor('not_found'), 'grey.400');
  assert.equal(sectionPropagationStatusColor('old_version_compatible'), 'success.main');
  assert.equal(sectionPropagationStatusColor('extra_content'), 'warning.dark');
  assert.equal(sectionPropagationStatusColor('hierarchy'), 'warning.dark');
  assert.equal(sectionPropagationStatusColor('ambiguous'), 'error.main');
});

run('status colors cover remaining ui statuses', () => {
  const statuses: SectionPropagationUiStatus[] = [
    'compatible',
    'already_up_to_date',
    'page_break',
    'structure',
    'stale',
    'source_stale',
    'unsafe',
    'permission',
    'apply_error',
    'broken',
  ];
  for (const status of statuses) {
    assert.ok(sectionPropagationStatusColor(status));
  }
});

console.log('section-propagation-list ok');
