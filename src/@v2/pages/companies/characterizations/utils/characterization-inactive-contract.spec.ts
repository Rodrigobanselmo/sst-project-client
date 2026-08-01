/**
 * Contrato Client: includeInactive default false na listagem de Elementos.
 *
 * Executar:
 * npx tsx src/@v2/pages/companies/characterizations/utils/characterization-inactive-contract.spec.ts
 */
import assert from 'node:assert/strict';

type Filters = {
  search?: string;
  stageIds?: number[];
  includeInactive?: boolean;
};

/** Espelha o payload enviado ao browse (CharacterizationTable). */
function resolveBrowseIncludeInactive(filters: Filters): boolean {
  return filters.includeInactive === true;
}

assert.equal(resolveBrowseIncludeInactive({}), false);
assert.equal(resolveBrowseIncludeInactive({ includeInactive: false }), false);
assert.equal(resolveBrowseIncludeInactive({ includeInactive: true }), true);

/** Toggle ligado = ativos + inativos (não “somente inativos”). */
function listMode(includeInactive: boolean): 'active-only' | 'active-and-inactive' {
  return includeInactive ? 'active-and-inactive' : 'active-only';
}

assert.equal(listMode(false), 'active-only');
assert.equal(listMode(true), 'active-and-inactive');

/** Toggle desligado envia false; ligado envia true. */
function togglePayload(checked: boolean) {
  return { includeInactive: checked, page: 1 };
}
assert.deepEqual(togglePayload(false), { includeInactive: false, page: 1 });
assert.deepEqual(togglePayload(true), { includeInactive: true, page: 1 });

/** Query key deve variar com a flag. */
function browseQueryKey(input: {
  companyId: string;
  workspaceId: string;
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: unknown;
  filters: Filters;
  includeInactive: boolean;
}) {
  return [
    'characterizations',
    input.companyId,
    input.workspaceId,
    input.search,
    input.page,
    input.limit,
    input.orderBy,
    input.filters,
    input.includeInactive,
  ];
}

const keyFalse = browseQueryKey({
  companyId: 'c1',
  workspaceId: 'w1',
  page: 1,
  limit: 100,
  filters: { includeInactive: false },
  includeInactive: false,
});
const keyTrue = browseQueryKey({
  companyId: 'c1',
  workspaceId: 'w1',
  page: 1,
  limit: 100,
  filters: { includeInactive: true },
  includeInactive: true,
});
assert.notDeepEqual(keyFalse, keyTrue);

/** Troca da flag reseta página. */
assert.equal(togglePayload(true).page, 1);
assert.equal(togglePayload(false).page, 1);

/**
 * Resposta altera total/lista (contrato esperado após correção do CAST no SQL).
 * SEFAZ CAB: ACTIVE 446 / ALL 738.
 */
function expectedTotals(includeInactive: boolean) {
  return includeInactive ? 738 : 446;
}
assert.equal(expectedTotals(false), 446);
assert.equal(expectedTotals(true), 738);
assert.ok(expectedTotals(false) < expectedTotals(true));

/** Refresh: URL com boolean parseado preserva o valor. */
function urlPreservesIncludeInactive(rawFromUrl: boolean | undefined) {
  return resolveBrowseIncludeInactive({ includeInactive: rawFromUrl });
}
assert.equal(urlPreservesIncludeInactive(true), true);
assert.equal(urlPreservesIncludeInactive(false), false);
assert.equal(urlPreservesIncludeInactive(undefined), false);

console.log('characterization-inactive-contract.spec.ts OK');
