/**
 * Runnable with:
 *   npx tsx src/components/organisms/modals/ModalAddCharacterization/hooks/commit-characterization-hierarchy-selection.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  CharacterizationHierarchyUnlinkError,
  CharacterizationHierarchyUpsertError,
  collectCharacterizationLinkIdsToEnd,
  commitCharacterizationHierarchySelection,
} from './commit-characterization-hierarchy-selection';

function run(name: string, fn: () => void | Promise<void>) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      console.log(`✓ ${name}`);
    })
    .catch((error) => {
      console.error(`✗ ${name}`);
      throw error;
    });
}

const workspaceId = 'matriz';

const hierarchies = [
  {
    id: 'pintura',
    hierarchyOnHomogeneous: [
      { id: 11, hierarchyId: 'pintura', workspaceId, endDate: null },
    ],
  },
  {
    id: 'servicos',
    hierarchyOnHomogeneous: [
      { id: 22, hierarchyId: 'servicos', workspaceId, endDate: null },
      { id: 23, hierarchyId: 'servicos', workspaceId, endDate: '2020-01-01' },
    ],
  },
  {
    id: 'outro-estab',
    hierarchyOnHomogeneous: [
      {
        id: 33,
        hierarchyId: 'outro-estab',
        workspaceId: 'filial',
        endDate: null,
      },
    ],
  },
  {
    id: 'cargo-a',
    hierarchyOnHomogeneous: [
      { id: 41, hierarchyId: 'cargo-a', workspaceId, endDate: null },
    ],
  },
  {
    id: 'cargo-b',
    hierarchyOnHomogeneous: [
      { id: 42, hierarchyId: 'cargo-b', workspaceId, endDate: null },
    ],
  },
];

async function main() {
  await run('desmarcar uma estrutura encerra somente o vínculo dela', () => {
    assert.deepEqual(
      collectCharacterizationLinkIdsToEnd({
        hierarchies,
        confirmedHierarchyIds: ['pintura', 'cargo-a', 'cargo-b'],
        workspaceId,
      }),
      [22],
    );
  });

  await run('manter só uma estrutura encerra os outros vínculos deste estabelecimento', () => {
    assert.deepEqual(
      collectCharacterizationLinkIdsToEnd({
        hierarchies,
        confirmedHierarchyIds: ['pintura'],
        workspaceId,
      }),
      [22, 41, 42],
    );
  });

  await run('seleção vazia encerra os vínculos ativos deste estabelecimento', () => {
    assert.deepEqual(
      collectCharacterizationLinkIdsToEnd({
        hierarchies,
        confirmedHierarchyIds: [],
        workspaceId,
      }),
      [11, 22, 41, 42],
    );
  });

  await run('substituição de cargos pelo setor não materializa os subordinados', () => {
    const linkIds = collectCharacterizationLinkIdsToEnd({
      hierarchies,
      confirmedHierarchyIds: ['pintura'],
      workspaceId,
    });
    assert.equal(linkIds.includes(41), true);
    assert.equal(linkIds.includes(42), true);
    assert.equal(linkIds.includes(11), false);
    assert.equal(linkIds.includes(99), false);
  });

  await run('vínculo de outro estabelecimento permanece', () => {
    const linkIds = collectCharacterizationLinkIdsToEnd({
      hierarchies,
      confirmedHierarchyIds: [],
      workspaceId,
    });
    assert.equal(linkIds.includes(33), false);
  });

  await run('falha na exclusão não executa o upsert', async () => {
    let upserted = false;
    await assert.rejects(
      () =>
        commitCharacterizationHierarchySelection({
          hierarchies,
          confirmedHierarchyIds: ['pintura'],
          workspaceId,
          unlink: async () => {
            throw new Error('rede');
          },
          upsert: async () => {
            upserted = true;
          },
        }),
      (error: unknown) => error instanceof CharacterizationHierarchyUnlinkError,
    );
    assert.equal(upserted, false);
  });

  await run('exclusão sem resposta não executa o upsert', async () => {
    let upserted = false;
    await assert.rejects(
      () =>
        commitCharacterizationHierarchySelection({
          hierarchies,
          confirmedHierarchyIds: [],
          workspaceId,
          unlink: async () => null,
          upsert: async () => {
            upserted = true;
          },
        }),
      (error: unknown) => error instanceof CharacterizationHierarchyUnlinkError,
    );
    assert.equal(upserted, false);
  });

  await run('exclusão concluída precede o upsert e a falha seguinte atualiza a tela', async () => {
    const calls: string[] = [];
    await assert.rejects(
      () =>
        commitCharacterizationHierarchySelection({
          hierarchies,
          confirmedHierarchyIds: ['pintura'],
          workspaceId,
          unlink: async (ids) => {
            calls.push(`unlink:${ids.join(',')}`);
            return { ok: true };
          },
          upsert: async () => {
            calls.push('upsert');
            throw new Error('upsert');
          },
          refreshAfterPartialFailure: async () => {
            calls.push('refresh');
          },
        }),
      (error: unknown) => error instanceof CharacterizationHierarchyUpsertError,
    );
    assert.deepEqual(calls, ['unlink:22,41,42', 'upsert', 'refresh']);
  });

  await run('inclusão sem remoção não chama a exclusão', async () => {
    let unlinked = false;
    await commitCharacterizationHierarchySelection({
      hierarchies: hierarchies.slice(0, 1),
      confirmedHierarchyIds: ['pintura', 'novo-cargo'],
      workspaceId,
      unlink: async () => {
        unlinked = true;
        return { ok: true };
      },
      upsert: async () => ({ ok: true }),
    });
    assert.equal(unlinked, false);
  });

  await run('editor e diálogo rápido confirmam pelo mesmo commit', () => {
    const editor = readFileSync(
      resolve(
        'src/components/organisms/modals/ModalAddCharacterization/hooks/useEditCharacterization.tsx',
      ),
      'utf8',
    );
    const dialog = readFileSync(
      resolve(
        'src/@v2/pages/companies/characterizations/components/CharacterizationTable/quick-actions/CharacterizationCargoManagerDialog.tsx',
      ),
      'utf8',
    );
    assert.equal(
      editor.includes('commitCharacterizationHierarchySelection'),
      true,
    );
    assert.equal(
      dialog.includes('commitCharacterizationHierarchySelection'),
      true,
    );
    assert.equal(editor.includes('deleteGho('), true);
    assert.equal(dialog.includes('deleteGho('), true);
    assert.equal(dialog.includes('gseCargoSelect'), false);
  });

  console.log('\nAll characterization hierarchy commit tests passed.');
}

main();
