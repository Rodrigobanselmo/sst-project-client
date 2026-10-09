/**
 * Runnable with:
 *   npx tsx src/components/organisms/modals/ModalSelectHierarchy/characterization-cargo-membership.util.spec.ts
 */
import assert from 'assert';

import { IGho } from 'core/interfaces/api/IGho';

import {
  buildCharacterizationMembershipByHierarchyId,
  formatCharacterizationMembershipIconTooltip,
} from './characterization-cargo-membership.util';

function run(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const workspaceId = 'sede';

const ghos = [
  {
    id: 'gho-atual',
    name: 'AGE',
    workspaceIds: [workspaceId],
    characterization: { id: 'age', name: 'AGE', type: 'OPERATION' },
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-1', workspaceId, endDate: null },
    ],
  },
  {
    id: 'gho-anexo',
    name: 'Prédio Anexo',
    workspaceIds: [workspaceId],
    characterization: { id: 'anexo', name: 'Prédio Anexo', type: 'GENERAL' },
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-1', workspaceId, endDate: null },
    ],
  },
  {
    id: 'gho-sede',
    name: 'Prédio Sede',
    workspaceIds: [workspaceId],
    characterization: {
      id: 'sede-el',
      name: 'Prédio Sede — Segundo Andar',
      type: 'GENERAL',
    },
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-1', workspaceId, endDate: null },
    ],
  },
] as unknown as IGho[];

run('o elemento em edição não aparece entre os outros vínculos', () => {
  const map = buildCharacterizationMembershipByHierarchyId(
    ghos,
    workspaceId,
    'age',
  );
  const names = (map.get('cargo-1') || []).map((item) => item.name);
  assert.deepEqual(names, [
    'Prédio Anexo',
    'Prédio Sede — Segundo Andar',
  ]);
});

run('tooltip informa que o cargo também está vinculado', () => {
  assert.equal(
    formatCharacterizationMembershipIconTooltip({
      id: 'anexo',
      name: 'Prédio Anexo',
    }),
    'Também vinculado em: Prédio Anexo',
  );
  assert.equal(
    formatCharacterizationMembershipIconTooltip(
      { id: 'anexo', name: 'Prédio Anexo' },
      ['Outro'],
    ),
    'Também vinculado em: Prédio Anexo\n+ 1 outros: Outro',
  );
});

console.log('\nAll characterization membership tooltip tests passed.');
