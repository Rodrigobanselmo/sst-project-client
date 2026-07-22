/**
 * Executar: npx tsx --test src/@v2/services/forms/frps-explainability-library/service/frps-explainability-library-query.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  buildFrpsCatalogAdminQueryParams,
  buildFrpsExplainabilityLibraryQueryParams,
} from './frps-explainability-library-query.util';

describe('buildFrpsExplainabilityLibraryQueryParams', () => {
  it('serializes only defined browse filters for the API endpoint', () => {
    const query = buildFrpsExplainabilityLibraryQueryParams({
      riskType: 'ERG',
      riskSubTypeEnum: 'PSICOSOCIAL',
      kind: 'RECOMMENDATION',
      status: 'DRAFT_AI',
      search: '  prazos  ',
      page: 1,
      limit: 20,
      generalCatalog: true,
    });

    assert.deepEqual(query, {
      riskType: 'ERG',
      riskSubTypeEnum: 'PSICOSOCIAL',
      kind: 'RECOMMENDATION',
      status: 'DRAFT_AI',
      search: 'prazos',
      page: 1,
      limit: 20,
      generalCatalog: true,
    });
  });
});

describe('buildFrpsCatalogAdminQueryParams', () => {
  it('serializes admin filters including origin and equivalence flags', () => {
    const query = buildFrpsCatalogAdminQueryParams({
      riskType: 'ERG',
      catalogType: 'SOURCE',
      origin: 'LOCAL',
      companyId: 'company-a',
      hasExplanation: true,
      hasEquivalence: false,
      page: 1,
      limit: 20,
    });

    assert.deepEqual(query, {
      riskType: 'ERG',
      catalogType: 'SOURCE',
      origin: 'LOCAL',
      companyId: 'company-a',
      hasExplanation: true,
      hasEquivalence: false,
      page: 1,
      limit: 20,
    });
  });
});
