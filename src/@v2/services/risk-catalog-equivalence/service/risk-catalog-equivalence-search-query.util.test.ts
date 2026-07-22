/**
 * Executar: npx tsx --test src/@v2/services/risk-catalog-equivalence/service/risk-catalog-equivalence-search-query.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { RiskCatalogKind } from './risk-catalog-equivalence.types';
import { buildSearchQueryParams } from './risk-catalog-equivalence-search-query.util';

describe('risk catalog search query params (server-side text filter)', () => {
  it('envia o termo de busca ao servidor (não filtra localmente os 100)', () => {
    const query = buildSearchQueryParams({
      kind: RiskCatalogKind.GENERATE_SOURCE,
      riskId: 'risk-1',
      search: '  zzz-termo-unico-fora-dos-primeiros  ',
      includeSystem: true,
    });

    assert.deepEqual(query, {
      kind: RiskCatalogKind.GENERATE_SOURCE,
      riskId: 'risk-1',
      search: 'zzz-termo-unico-fora-dos-primeiros',
      includeSystem: true,
    });
  });

  it('omite search vazio para não restringir o where no servidor', () => {
    const query = buildSearchQueryParams({
      kind: RiskCatalogKind.REC_MED,
      search: '   ',
    });

    assert.equal('search' in query, false);
  });
});
