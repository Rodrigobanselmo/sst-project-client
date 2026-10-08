/**
 * Criação de GSE e persistência do modal de cargos.
 * Executar:
 * npx tsx src/components/organisms/modals/ModalAddGHO/gse-create-and-cargo-persist.util.spec.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  buildGseCreateWorkspacePayload,
  resolveGseCreateWorkspaceIds,
} from './resolve-gse-create-workspaces.util';
import {
  nextGseCargoBaseline,
  resolveGseCargoPersist,
} from './resolve-gse-cargo-persist.util';

const company = ['matriz', 'moeve', 'mataripe'];
const pintura = 'pintura//matriz';

// H. Contexto Matriz abre com Matriz já selecionada.
assert.deepEqual(
  resolveGseCreateWorkspaceIds({
    tabWorkspaceId: 'matriz',
    companyWorkspaceIds: company,
  }),
  ['matriz'],
);

// I. Criar sem alterar essa seleção envia só Matriz.
assert.deepEqual(buildGseCreateWorkspacePayload(['matriz']), ['matriz']);

// J. Acrescentar Moeve envia exatamente a seleção.
assert.deepEqual(buildGseCreateWorkspacePayload(['matriz', 'moeve']), [
  'matriz',
  'moeve',
]);

// K. Selecionar todos explicitamente envia todos, sem inferir a partir de vazio.
assert.deepEqual(buildGseCreateWorkspacePayload(company), company);
assert.equal(buildGseCreateWorkspacePayload([]), null);
assert.deepEqual(
  resolveGseCreateWorkspaceIds({
    tabWorkspaceId: '',
    companyWorkspaceIds: company,
  }),
  [],
);

// S. Toda a empresa e nenhum estabelecimento: sem POST.
assert.equal(
  resolveGseCreateWorkspaceIds({
    companyWorkspaceIds: company,
  }).length,
  0,
);
assert.equal(buildGseCreateWorkspacePayload([]), null);
assert.deepEqual(
  resolveGseCreateWorkspaceIds({
    tabWorkspaceId: 'desconhecido',
    companyWorkspaceIds: company,
  }),
  [],
);

const hydrated = {
  hydrated: true,
  baselineGseId: 'gse-pintura',
  openGseId: 'gse-pintura',
  baselineIds: [pintura],
  startDate: null as Date | null,
  endDate: null as Date | null,
};

// C / L. Confirmar sem alteração não apaga o vínculo.
const unchanged = resolveGseCargoPersist({
  ...hydrated,
  finalIds: [],
  selectionTouched: false,
});
assert.equal(unchanged.action, 'patch');
if (unchanged.action === 'patch') {
  assert.deepEqual(unchanged.hierarchyModalIds, [pintura]);
  assert.equal(unchanged.compositionChanged, false);
}

// D / O. Remover o último vínculo explícito envia [].
const removeLast = resolveGseCargoPersist({
  ...hydrated,
  finalIds: [],
  selectionTouched: true,
});
assert.equal(removeLast.action, 'patch');
if (removeLast.action === 'patch') {
  assert.deepEqual(removeLast.hierarchyModalIds, []);
  assert.equal(removeLast.compositionChanged, true);
}

// E / N. Remover todos, com mais de um vínculo, envia [].
const removeAll = resolveGseCargoPersist({
  ...hydrated,
  baselineIds: [pintura, 'solda//matriz'],
  finalIds: [],
  selectionTouched: true,
});
assert.equal(removeAll.action, 'patch');
if (removeAll.action === 'patch') {
  assert.deepEqual(removeAll.hierarchyModalIds, []);
}

// M. Antes da hidratação, [] não vira remoção.
const loading = resolveGseCargoPersist({
  hydrated: false,
  baselineGseId: null,
  openGseId: 'gse-pintura',
  baselineIds: null,
  finalIds: [],
  selectionTouched: false,
});
assert.equal(loading.action, 'block');

const touchedWhileLoading = resolveGseCargoPersist({
  hydrated: false,
  baselineGseId: null,
  openGseId: 'gse-pintura',
  baselineIds: null,
  finalIds: [],
  selectionTouched: true,
});
assert.equal(touchedWhileLoading.action, 'block');

// P. Só a vigência muda: a composição continua sendo a linha de base.
const dateOnly = resolveGseCargoPersist({
  ...hydrated,
  finalIds: [],
  selectionTouched: false,
  startDate: new Date('2024-01-02'),
  endDate: null,
});
assert.equal(dateOnly.action, 'patch');
if (dateOnly.action === 'patch') {
  assert.deepEqual(dateOnly.hierarchyModalIds, [pintura]);
  assert.equal(dateOnly.compositionChanged, false);
  assert.equal(
    (dateOnly.startDate as Date).toISOString().slice(0, 10),
    '2024-01-02',
  );
}

// Q. Loading não estabelece [] como linha de base, nem em reabertura.
assert.equal(
  nextGseCargoBaseline({
    openGseId: 'gse-pintura',
    querySettled: false,
    queryGseId: undefined,
    loadedIds: [],
  }),
  null,
);
assert.equal(
  nextGseCargoBaseline({
    openGseId: 'gse-pintura',
    querySettled: false,
    queryGseId: 'gse-pintura',
    loadedIds: [],
  }),
  null,
);
assert.deepEqual(
  nextGseCargoBaseline({
    openGseId: 'gse-pintura',
    querySettled: true,
    queryGseId: 'gse-pintura',
    loadedIds: [pintura],
  }),
  { gseId: 'gse-pintura', ids: [pintura] },
);

// R. Trocar de GSE não reaproveita a linha de base anterior.
assert.equal(
  nextGseCargoBaseline({
    openGseId: 'gse-outro',
    querySettled: false,
    queryGseId: 'gse-pintura',
    loadedIds: [pintura],
  }),
  null,
);
assert.deepEqual(
  nextGseCargoBaseline({
    openGseId: 'gse-outro',
    querySettled: true,
    queryGseId: 'gse-outro',
    loadedIds: ['almox//matriz'],
  }),
  { gseId: 'gse-outro', ids: ['almox//matriz'] },
);

const addGhoSource = readFileSync(
  resolve('src/components/organisms/modals/ModalAddGHO/hooks/useAddGho.ts'),
  'utf8',
);
assert.equal(addGhoSource.includes('buildGseCreateWorkspacePayload'), true);
assert.equal(addGhoSource.includes('resolveGseCargoPersist'), true);
assert.equal(addGhoSource.includes('if (!createWorkspaceIds)'), true);
assert.equal(addGhoSource.includes('workspaceIds: createWorkspaceIds'), true);
assert.equal(
  addGhoSource.includes('ghoData.workspaceIdsTouched'),
  true,
);
const importSource = readFileSync(
  resolve('src/components/organisms/tables/GhosTable/useGseImportFlow.ts'),
  'utf8',
);
assert.equal(importSource.includes('resolveGseCreateWorkspaceIds'), false);
assert.equal(importSource.includes('buildGseCreateWorkspacePayload'), false);

const selectSource = readFileSync(
  resolve(
    'src/components/organisms/modals/ModalSelectHierarchy/SelectData/index.tsx',
  ),
  'utf8',
);
assert.equal(
  selectSource.includes('if (selectedData.gseCargoSelect && !selectedData.gseCargoHydrated) return;'),
  true,
);
assert.equal(selectSource.includes('markGseCargoSelectionTouched'), true);

console.log('gse-create-and-cargo-persist.util.spec.ts ok');
