/**
 * Executar:
 * npx tsx src/core/hooks/useCompanyWorkspaceCardsCollapsed.util.spec.ts
 */
import assert from 'node:assert/strict';

import {
  COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT,
  COMPANY_WORKSPACE_CARDS_COLLAPSED_LEGACY_STORAGE_KEY,
  COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY,
  getCompanyWorkspaceCardsToggleLabel,
  parseCompanyWorkspaceCardsCollapsed,
  readCompanyWorkspaceCardsCollapsed,
  writeCompanyWorkspaceCardsCollapsed,
} from './useCompanyWorkspaceCardsCollapsed.util';

assert.equal(COMPANY_WORKSPACE_CARDS_COLLAPSED_DEFAULT, false);
assert.equal(
  COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY,
  'companyWorkspaceCardsCollapsed',
);
assert.equal(
  COMPANY_WORKSPACE_CARDS_COLLAPSED_LEGACY_STORAGE_KEY,
  'characterizationSummaryCollapsed',
);

assert.equal(parseCompanyWorkspaceCardsCollapsed(null), false);
assert.equal(parseCompanyWorkspaceCardsCollapsed(undefined), false);
assert.equal(parseCompanyWorkspaceCardsCollapsed(''), false);
assert.equal(parseCompanyWorkspaceCardsCollapsed('true'), true);
assert.equal(parseCompanyWorkspaceCardsCollapsed('false'), false);
assert.equal(parseCompanyWorkspaceCardsCollapsed('{'), false);
assert.equal(parseCompanyWorkspaceCardsCollapsed('1'), false);

assert.equal(getCompanyWorkspaceCardsToggleLabel(true), 'Mostrar cards');
assert.equal(getCompanyWorkspaceCardsToggleLabel(false), 'Ocultar cards');
assert.ok(!getCompanyWorkspaceCardsToggleLabel(true).includes('resumo'));

// SSR / sem window
assert.equal(readCompanyWorkspaceCardsCollapsed(), false);

if (typeof localStorage !== 'undefined') {
  localStorage.removeItem(COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY);
  localStorage.removeItem(COMPANY_WORKSPACE_CARDS_COLLAPSED_LEGACY_STORAGE_KEY);

  // preferência ausente → default
  assert.equal(readCompanyWorkspaceCardsCollapsed(), false);

  // migração da chave legada
  localStorage.setItem(
    COMPANY_WORKSPACE_CARDS_COLLAPSED_LEGACY_STORAGE_KEY,
    JSON.stringify(true),
  );
  assert.equal(readCompanyWorkspaceCardsCollapsed(), true);
  assert.equal(
    localStorage.getItem(COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY),
    JSON.stringify(true),
  );

  // persistência exclusiva na nova chave
  writeCompanyWorkspaceCardsCollapsed(false);
  assert.equal(
    localStorage.getItem(COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY),
    JSON.stringify(false),
  );
  assert.equal(readCompanyWorkspaceCardsCollapsed(), false);

  localStorage.removeItem(COMPANY_WORKSPACE_CARDS_COLLAPSED_STORAGE_KEY);
  localStorage.removeItem(COMPANY_WORKSPACE_CARDS_COLLAPSED_LEGACY_STORAGE_KEY);
}

console.log('useCompanyWorkspaceCardsCollapsed.util.spec.ts OK');
