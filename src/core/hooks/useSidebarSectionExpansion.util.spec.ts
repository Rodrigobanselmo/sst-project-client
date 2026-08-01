/**
 * Specs da expansão persistente das seções da sidebar (Fase C).
 *
 * Executar:
 * npx tsx src/core/hooks/useSidebarSectionExpansion.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  getSidebarSectionToggleLabel,
  isSidebarSectionExpanded,
  isSidebarSectionId,
  parseSidebarSectionExpansionState,
  readSidebarSectionExpansionState,
  SIDEBAR_SECTION_EXPANDED_DEFAULT,
  SIDEBAR_SECTION_EXPANSION_STORAGE_KEY,
  SIDEBAR_SECTION_IDS,
  sidebarSectionPanelId,
  writeSidebarSectionExpansionState,
  type SidebarSectionExpansionState,
  type SidebarSectionId,
} from './useSidebarSectionExpansion.util';

assert.equal(SIDEBAR_SECTION_EXPANSION_STORAGE_KEY, 'sidebarSectionExpansionState');
assert.equal(SIDEBAR_SECTION_EXPANDED_DEFAULT, true);
assert.deepEqual([...SIDEBAR_SECTION_IDS], [
  'general',
  'companyManagement',
  'operations',
  'technicalRegistrations',
  'librariesAndCuration',
  'administration',
]);

// 1) Sem preferência → todos abertos
const empty: SidebarSectionExpansionState = {};
for (const id of SIDEBAR_SECTION_IDS) {
  assert.equal(isSidebarSectionExpanded(empty, id), true);
}

// 2/3) Recolher oculta logicamente; reabrir restaura
const collapsedOps: SidebarSectionExpansionState = { operations: false };
assert.equal(isSidebarSectionExpanded(collapsedOps, 'operations'), false);
assert.equal(isSidebarSectionExpanded(collapsedOps, 'general'), true);
const reopened: SidebarSectionExpansionState = {
  ...collapsedOps,
  operations: true,
};
assert.equal(isSidebarSectionExpanded(reopened, 'operations'), true);

// 6) Conteúdo inválido → fallback seguro
assert.deepEqual(parseSidebarSectionExpansionState(null), {});
assert.deepEqual(parseSidebarSectionExpansionState(''), {});
assert.deepEqual(parseSidebarSectionExpansionState('{'), {});
assert.deepEqual(parseSidebarSectionExpansionState('[]'), {});
assert.deepEqual(parseSidebarSectionExpansionState('"x"'), {});
assert.deepEqual(parseSidebarSectionExpansionState('1'), {});

// Valores não-booleanos ignorados; parciais OK
assert.deepEqual(
  parseSidebarSectionExpansionState(
    JSON.stringify({
      operations: false,
      general: 'nope',
      unknownFuture: false,
      technicalRegistrations: true,
    }),
  ),
  { operations: false, technicalRegistrations: true },
);

// 7) Nova seção sem valor salvo inicia aberta
assert.equal(
  isSidebarSectionExpanded({ operations: false }, 'librariesAndCuration'),
  true,
);

// 8) Rota ativa força abertura (simulação de ensureExpanded)
function ensureExpanded(
  state: SidebarSectionExpansionState,
  id: SidebarSectionId,
): SidebarSectionExpansionState {
  if (isSidebarSectionExpanded(state, id)) return state;
  return { ...state, [id]: true };
}
assert.deepEqual(
  ensureExpanded({ technicalRegistrations: false }, 'technicalRegistrations'),
  { technicalRegistrations: true },
);
assert.deepEqual(
  ensureExpanded({ technicalRegistrations: true }, 'technicalRegistrations'),
  { technicalRegistrations: true },
);

// 9) Pais internos: documentado como responsabilidade do forceShowSubItems
//    (NavLink) — a seção principal librariesAndCuration deve abrir:
assert.equal(
  isSidebarSectionExpanded(
    ensureExpanded({ librariesAndCuration: false }, 'librariesAndCuration'),
    'librariesAndCuration',
  ),
  true,
);

// 12) Perfil fora do mecanismo
assert.equal(isSidebarSectionId('profile'), false);
assert.ok(!SIDEBAR_SECTION_IDS.includes('profile' as SidebarSectionId));

// 13) Preferência não vinculada a empresa (chave global única)
assert.ok(!SIDEBAR_SECTION_EXPANSION_STORAGE_KEY.includes('company'));

// 14) SSR não acessa window indevidamente
assert.deepEqual(readSidebarSectionExpansionState(), {});

// 15) aria labels
assert.equal(
  getSidebarSectionToggleLabel('Cadastros Técnicos', true),
  'Recolher Cadastros Técnicos',
);
assert.equal(
  getSidebarSectionToggleLabel('Cadastros Técnicos', false),
  'Expandir Cadastros Técnicos',
);
assert.equal(
  sidebarSectionPanelId('technicalRegistrations'),
  'sidebar-section-panel-technicalRegistrations',
);

// 4/5) Persistência + restauração (quando localStorage disponível)
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem(SIDEBAR_SECTION_EXPANSION_STORAGE_KEY);

  assert.deepEqual(readSidebarSectionExpansionState(), {});

  const preferred: SidebarSectionExpansionState = {
    operations: false,
    technicalRegistrations: false,
    administration: true,
  };
  writeSidebarSectionExpansionState(preferred);
  assert.equal(
    localStorage.getItem(SIDEBAR_SECTION_EXPANSION_STORAGE_KEY),
    JSON.stringify(preferred),
  );

  const restored = readSidebarSectionExpansionState();
  assert.deepEqual(restored, preferred);
  assert.equal(isSidebarSectionExpanded(restored, 'operations'), false);
  assert.equal(isSidebarSectionExpanded(restored, 'general'), true);

  // Troca de "empresa" não muda a chave — mesma preferência
  const afterCompanySwitch = readSidebarSectionExpansionState();
  assert.deepEqual(afterCompanySwitch, preferred);

  localStorage.removeItem(SIDEBAR_SECTION_EXPANSION_STORAGE_KEY);
}

console.log('useSidebarSectionExpansion.util.spec.ts OK');
