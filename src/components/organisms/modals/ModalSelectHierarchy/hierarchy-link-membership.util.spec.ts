/**
 * Runnable with:
 *   npx tsx src/components/organisms/modals/ModalSelectHierarchy/hierarchy-link-membership.util.spec.ts
 */
import assert from 'assert';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { HomoTypeEnum } from 'core/enums/homo-type.enum';
import { IGho } from 'core/interfaces/api/IGho';

import {
  buildHierarchyLinkMembershipByHierarchyId,
  formatHierarchyLinkMembershipTooltip,
  hierarchyLinkMatchesWorkspace,
  sliceHierarchyLinkMembershipIndicators,
} from './hierarchy-link-membership.util';

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
    id: 'gse-atual',
    name: 'GSE Pintura',
    workspaceIds: [workspaceId],
    hierarchyOnHomogeneous: [
      { hierarchyId: 'setor-pintura', workspaceId, endDate: null },
      { hierarchyId: 'cargo-1', workspaceId, endDate: null },
    ],
  },
  {
    id: 'gse-outro',
    name: 'GSE Manutenção',
    workspaceIds: [workspaceId],
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-1', workspaceId, endDate: null },
      { hierarchyId: 'cargo-encerrado', workspaceId, endDate: '2020-01-01' },
    ],
  },
  {
    id: 'gse-filial',
    name: 'GSE Filial',
    workspaceIds: ['filial'],
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-1', workspaceId: 'filial', endDate: null },
    ],
  },
  {
    id: 'gho-age',
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
      { hierarchyId: 'setor-pintura', workspaceId, endDate: null },
    ],
  },
  {
    id: 'gho-ambiente',
    name: 'Ambiente',
    type: HomoTypeEnum.ENVIRONMENT,
    workspaceIds: [workspaceId],
    environment: { id: 'amb', name: 'Ambiente', type: 'GENERAL' },
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-1', workspaceId, endDate: null },
    ],
  },
  {
    id: 'gse-dois-estab',
    name: 'GSE Compartilhado',
    workspaceIds: [workspaceId, 'filial'],
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-1', workspaceId: '', endDate: null },
    ],
  },
  {
    id: 'gse-so-sede-sem-ws',
    name: 'GSE Sede sem workspace no vínculo',
    workspaceIds: [workspaceId],
    hierarchyOnHomogeneous: [
      { hierarchyId: 'cargo-sede', workspaceId: '', endDate: null },
    ],
  },
] as unknown as IGho[];

function idsOf(hierarchyId: string, exclude?: { gseId?: string; characterizationId?: string }) {
  const map = buildHierarchyLinkMembershipByHierarchyId(ghos, {
    workspaceId,
    excludeGseId: exclude?.gseId,
    excludeCharacterizationId: exclude?.characterizationId,
  });
  return (map.get(hierarchyId) || []).map((item) => `${item.kind}:${item.id}`);
}

run('GSE em edição vê o elemento, e o elemento vê o GSE', () => {
  const fromGse = idsOf('cargo-1', { gseId: 'gse-atual' });
  assert.equal(fromGse.includes('gse:gse-atual'), false);
  assert.equal(fromGse.includes('gse:gse-outro'), true);
  assert.equal(fromGse.includes('characterization:anexo'), true);
  assert.equal(fromGse.includes('characterization:age'), true);

  const fromElement = idsOf('cargo-1', { characterizationId: 'age' });
  assert.equal(fromElement.includes('characterization:age'), false);
  assert.equal(fromElement.includes('gse:gse-outro'), true);
  assert.equal(fromElement.includes('characterization:anexo'), true);
});

run('o próprio registro fica de fora nos dois módulos', () => {
  const editingBoth = idsOf('cargo-1', {
    gseId: 'gse-atual',
    characterizationId: 'age',
  });
  assert.equal(editingBoth.includes('gse:gse-atual'), false);
  assert.equal(editingBoth.includes('characterization:age'), false);
  assert.equal(editingBoth.includes('gse:gse-outro'), true);
});

run('vínculo encerrado, outro estabelecimento e ambiente não entram', () => {
  const cargo = idsOf('cargo-1');
  assert.equal(cargo.includes('gse:gse-filial'), false);
  assert.equal(idsOf('cargo-encerrado').includes('gse:gse-outro'), false);
  assert.equal(
    cargo.some((item) => item.includes('amb') || item.includes('Ambiente')),
    false,
  );
});

run('o indicador não desce para o cargo abrangido pelo setor', () => {
  const sector = idsOf('setor-pintura', { gseId: 'gse-atual' });
  assert.equal(sector.includes('characterization:anexo'), true);
  assert.equal(idsOf('pintor-1').length, 0);
});

run('vínculo sem workspaceId acompanha os estabelecimentos do grupo', () => {
  assert.equal(hierarchyLinkMatchesWorkspace('sede', ''), true);
  assert.equal(hierarchyLinkMatchesWorkspace('filial', ''), true);
  assert.equal(hierarchyLinkMatchesWorkspace('filial', 'sede'), false);

  const atSede = buildHierarchyLinkMembershipByHierarchyId(ghos, {
    workspaceId: 'sede',
  }).get('cargo-1');
  const atFilial = buildHierarchyLinkMembershipByHierarchyId(ghos, {
    workspaceId: 'filial',
  }).get('cargo-1');

  assert.equal(
    (atSede || []).some((item) => item.id === 'gse-dois-estab'),
    true,
  );
  assert.equal(
    (atFilial || []).some((item) => item.id === 'gse-dois-estab'),
    true,
  );
  assert.equal(
    (atFilial || []).some((item) => item.id === 'gse-so-sede-sem-ws'),
    false,
  );
  assert.equal(
    (atFilial || []).some((item) => item.id === 'gse-outro'),
    false,
  );
});

run('o resumo identifica o tipo de cada vínculo oculto', () => {
  const memberships =
    buildHierarchyLinkMembershipByHierarchyId(ghos, { workspaceId }).get(
      'cargo-1',
    ) || [];
  assert.ok(memberships.length > 3);
  const sliced = sliceHierarchyLinkMembershipIndicators(memberships);
  assert.equal(sliced.visible.length, 3);
  assert.ok(sliced.overflow.length >= 1);
  const tooltip = formatHierarchyLinkMembershipTooltip(
    sliced.visible[2],
    sliced.overflow,
  );
  sliced.overflow.forEach((item) => {
    const prefix =
      item.kind === 'gse'
        ? 'Vinculado ao GSE: '
        : 'Vinculado ao Elemento Caracterizado: ';
    assert.equal(tooltip.includes(`${prefix}${item.name}`), true);
  });
  assert.equal(
    formatHierarchyLinkMembershipTooltip({
      id: 'gse-outro',
      name: 'GSE Manutenção',
      kind: 'gse',
    }),
    'Vinculado ao GSE: GSE Manutenção',
  );
  assert.equal(
    formatHierarchyLinkMembershipTooltip({
      id: 'anexo',
      name: 'Prédio Anexo',
      kind: 'characterization',
    }),
    'Vinculado ao Elemento Caracterizado: Prédio Anexo',
  );
});

const selectSource = readFileSync(
  resolve('src/components/organisms/modals/ModalSelectHierarchy/SelectData/index.tsx'),
  'utf8',
);
run('a árvore usa o indicador compartilhado e as colunas antigas permanecem', () => {
  const treeStart = selectSource.indexOf('isUnifiedHierarchyTree && workspaceSelected?.id');
  const tree = selectSource.slice(treeStart, treeStart + 1600);
  assert.equal(tree.includes('HierarchyLinkMembershipIcons'), true);
  assert.equal(tree.includes('CharacterizationCargoMembershipIcons'), false);
  assert.equal(selectSource.includes('CharacterizationCargoMembershipIcons'), true);
  assert.equal(selectSource.includes('GseCargoMembershipIcons'), true);
});

console.log('\nAll hierarchy link membership tests passed.');
