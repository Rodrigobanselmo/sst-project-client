/**
 * Explicit organogram page gates (no white screen).
 * Executar: npx tsx src/pages/dashboard/empresas/[companyId]/hierarquia/hierarchy-page.states.spec.ts
 */
import assert from 'node:assert/strict';

type Gate =
  | { state: 'loading'; message: string }
  | { state: 'error'; message: string; canRetry: true }
  | { state: 'empty'; message: string; showTree: true }
  | { state: 'success'; showTree: true; deepLinkBanner?: string };

function resolveHierarchyPageGate(input: {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  hasCompany: boolean;
  missingNodeMessage?: string | null;
}): Gate {
  if (input.isLoading) {
    return {
      state: 'loading',
      message: 'Carregando estrutura organizacional…',
    };
  }
  if (input.isError) {
    return {
      state: 'error',
      message: 'Não foi possível carregar a estrutura organizacional.',
      canRetry: true,
    };
  }
  if (!input.hasCompany) {
    return {
      state: 'error',
      message: 'Empresa não disponível para carregar a estrutura organizacional.',
      canRetry: true,
    };
  }
  if (input.isEmpty) {
    return {
      state: 'empty',
      message:
        'Nenhuma estrutura organizacional cadastrada neste estabelecimento.',
      showTree: true,
    };
  }
  return {
    state: 'success',
    showTree: true,
    deepLinkBanner: input.missingNodeMessage || undefined,
  };
}

assert.equal(
  resolveHierarchyPageGate({
    isLoading: true,
    isError: false,
    isEmpty: false,
    hasCompany: false,
  }).state,
  'loading',
);

assert.equal(
  resolveHierarchyPageGate({
    isLoading: false,
    isError: true,
    isEmpty: false,
    hasCompany: true,
  }).state,
  'error',
);

const empty = resolveHierarchyPageGate({
  isLoading: false,
  isError: false,
  isEmpty: true,
  hasCompany: true,
});
assert.equal(empty.state, 'empty');
if (empty.state === 'empty') assert.equal(empty.showTree, true);

const ok = resolveHierarchyPageGate({
  isLoading: false,
  isError: false,
  isEmpty: false,
  hasCompany: true,
  missingNodeMessage: 'O item solicitado não foi encontrado neste estabelecimento. A árvore restante permanece disponível.',
});
assert.equal(ok.state, 'success');
if (ok.state === 'success') {
  assert.equal(ok.showTree, true);
  assert.ok(ok.deepLinkBanner?.includes('não foi encontrado'));
}

// Traditional access must not require deep-link params
const traditional = resolveHierarchyPageGate({
  isLoading: false,
  isError: false,
  isEmpty: false,
  hasCompany: true,
});
assert.equal(traditional.state, 'success');

console.log('hierarchy-page.states.spec.ts OK');
