import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildCharacterizationHierarchySelection,
  CharacterizationHierarchySnapshotError,
  commitCharacterizationHierarchySelection,
} from './commit-characterization-hierarchy-selection.ts';

const workspaceId = 'matriz';
const characterizationId = 'atividade';
const original = [
  {
    id: 'cargo-a',
    hierarchyOnHomogeneous: [
      {
        id: 22,
        hierarchyId: 'cargo-a',
        homogeneousGroupId: characterizationId,
        workspaceId,
        startDate: '2026-01-01T09:30:15-03:00',
        endDate: null,
      },
      {
        id: 20,
        hierarchyId: 'cargo-a',
        workspaceId,
        startDate: '2025-01-01',
        endDate: '2026-01-01',
      },
      {
        id: 21,
        hierarchyId: 'cargo-a',
        workspaceId,
        endDate: null,
        deletedAt: '2026-01-01',
      },
    ],
  },
  {
    id: 'setor//matriz',
    hierarchyOnHomogeneous: [
      { id: 11, workspaceId, startDate: null, endDate: null },
      { id: 33, hierarchyId: 'setor', workspaceId: 'filial', endDate: null },
      {
        id: 44,
        hierarchyId: 'setor',
        homogeneousGroupId: 'outra-atividade',
        workspaceId,
        endDate: null,
      },
    ],
  },
];
const build = (confirmedHierarchyIds: string[]) =>
  buildCharacterizationHierarchySelection({
    hierarchies: original,
    confirmedHierarchyIds,
    workspaceId,
    characterizationId,
  });

async function main() {
  const before = JSON.stringify(original);
  const selection = build([' cargo-b//matriz ', 'cargo-b', 'setor', '']);
  assert.deepEqual(selection, {
    hierarchyIds: ['cargo-b', 'setor'],
    expectedLinks: [
      { id: 11, hierarchyId: 'setor', startDate: null, endDate: null },
      {
        id: 22,
        hierarchyId: 'cargo-a',
        startDate: '2026-01-01T12:30:15.000Z',
        endDate: null,
      },
      { id: 33, hierarchyId: 'setor', startDate: null, endDate: null },
    ],
  });
  assert.equal(
    JSON.stringify(original),
    before,
    'montar a nova seleção não altera vínculos carregados',
  );
  assert.deepEqual(
    build([]).expectedLinks,
    selection.expectedLinks,
    'seleção vazia ainda compara TODOS os vínculos abertos anteriores',
  );
  assert.deepEqual(
    build(['setor']).hierarchyIds,
    ['setor'],
    'abrangência de setor não materializa cargos descendentes',
  );
  assert.deepEqual(
    build(['cargo-a']).expectedLinks,
    selection.expectedLinks,
    'mantidos e retirados participam da concorrência',
  );

  const dated = buildCharacterizationHierarchySelection({
    hierarchies: original,
    confirmedHierarchyIds: ['cargo-b'],
    workspaceId,
    characterizationId,
    startDate: new Date('2026-04-01T00:00:00Z'),
    endDate: null,
  });
  assert.equal(dated.startDate, '2026-04-01T00:00:00.000Z');
  assert.equal(dated.endDate, null);
  assert.equal(
    dated.expectedLinks[1].startDate,
    '2026-01-01T12:30:15.000Z',
    'data proposta não reescreve o snapshot',
  );

  assert.throws(
    () =>
      buildCharacterizationHierarchySelection({
        hierarchies: [
          {
            id: 'cargo',
            hierarchyOnHomogeneous: [{ id: null, endDate: null }],
          },
        ],
        confirmedHierarchyIds: [],
        workspaceId,
        characterizationId,
      }),
    CharacterizationHierarchySnapshotError,
  );
  assert.throws(
    () =>
      buildCharacterizationHierarchySelection({
        hierarchies: [
          {
            id: 'cargo',
            hierarchyOnHomogeneous: [
              { id: 1, startDate: 'inválida', endDate: null },
            ],
          },
        ],
        confirmedHierarchyIds: [],
        workspaceId,
        characterizationId,
      }),
    CharacterizationHierarchySnapshotError,
  );

  const calls: unknown[] = [];
  const response = {
    id: characterizationId,
    addedLinkIds: [55],
    endedLinkIds: [22],
    removedLinkIds: [],
    unchangedLinkIds: [11],
  };
  const applied = await commitCharacterizationHierarchySelection({
    selection,
    persist: async (payload) => {
      calls.push(payload);
      return response;
    },
  });
  assert.equal(applied, response);
  assert.deepEqual(
    calls,
    [selection],
    'adição e retirada são enviadas numa única requisição',
  );
  for (const code of [
    'SST_MUTATION_CANCELLED',
    'SST_CHARACTERIZATION_SELECTION_CONFLICT',
  ]) {
    const rejection = Object.assign(new Error(code), { code });
    let attempts = 0;
    await assert.rejects(
      commitCharacterizationHierarchySelection({
        selection,
        persist: async () => {
          attempts++;
          throw rejection;
        },
      }),
      (error) => error === rejection,
    );
    assert.equal(
      attempts,
      1,
      'erro/cancelamento não inicia exclusão nem segunda gravação',
    );
    assert.deepEqual(
      selection,
      build(['cargo-b', 'setor']),
      'rascunho e baseline permanecem após falha',
    );
  }

  for (const path of [
    'src/components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization.tsx',
    'src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationCargoManagerDialog.tsx',
  ]) {
    const source = readFileSync(path, 'utf8');
    assert.ok(source.includes('commitCharacterizationHierarchySelection'));
    assert.ok(source.includes('useMutSelectCharacterizationHierarchies'));
    assert.equal(
      source.includes('deleteGho('),
      false,
      'nenhum chamador volta ao fluxo unlink → upsert',
    );
    assert.equal(source.includes('refreshAfterPartialFailure'), false);
  }
  console.log(
    'Characterization hierarchy selection: snapshot, concorrência, datas e commit atômico verificados.',
  );
}

void main();
