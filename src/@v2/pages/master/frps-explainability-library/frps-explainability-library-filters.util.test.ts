/**
 * Testes pontuais dos filtros/URL da Biblioteca FRPS (consulta).
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-explainability-library-filters.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  FRPS_LIBRARY_DEFAULT_RISK_SUB_TYPE_ENUM,
  FRPS_LIBRARY_DEFAULT_RISK_TYPE,
  applyFrpsLibraryCategoryChange,
  applyFrpsLibraryGeneralCatalog,
  applyFrpsLibrarySubtypeChange,
  buildFrpsLibraryBrowseParams,
  getFrpsLibraryDefaultUrlQuery,
  mapFrpsLibraryItemToTableRow,
  parseFrpsLibraryFiltersFromQuery,
  serializeFrpsLibraryFiltersToQuery,
  shouldApplyFrpsLibraryDefaultScope,
} from './frps-explainability-library-filters.util';

describe('FRPS library default scope URL', () => {
  it('applies ERG + PSICOSOCIAL when query is empty', () => {
    assert.equal(shouldApplyFrpsLibraryDefaultScope({}), true);
    const defaults = getFrpsLibraryDefaultUrlQuery();
    assert.equal(defaults.riskType, FRPS_LIBRARY_DEFAULT_RISK_TYPE);
    assert.equal(
      defaults.riskSubTypeEnum,
      FRPS_LIBRARY_DEFAULT_RISK_SUB_TYPE_ENUM,
    );
  });

  it('does not apply default when generalCatalog=true', () => {
    assert.equal(
      shouldApplyFrpsLibraryDefaultScope({ generalCatalog: 'true' }),
      false,
    );
  });

  it('round-trips default filters through parse/serialize', () => {
    const query = getFrpsLibraryDefaultUrlQuery();
    const filters = parseFrpsLibraryFiltersFromQuery(query);
    assert.equal(filters.riskType, 'ERG');
    assert.equal(filters.riskSubTypeEnum, 'PSICOSOCIAL');
    assert.equal(filters.page, 1);

    const serialized = serializeFrpsLibraryFiltersToQuery(filters);
    assert.equal(serialized.riskType, 'ERG');
    assert.equal(serialized.riskSubTypeEnum, 'PSICOSOCIAL');
    assert.equal(serialized.page, '1');
  });
});

describe('FRPS library hierarchical filters', () => {
  it('clears subtype and risk when category changes', () => {
    const next = applyFrpsLibraryCategoryChange(
      {
        riskType: 'ERG',
        riskSubTypeEnum: 'PSICOSOCIAL',
        riskSubTypeId: 1,
        riskId: 'risk-1',
        kind: 'SOURCE',
        status: null,
        search: '',
        page: 3,
        limit: 20,
        generalCatalog: false,
      },
      'FIS',
    );

    assert.equal(next.riskType, 'FIS');
    assert.equal(next.riskSubTypeEnum, null);
    assert.equal(next.riskSubTypeId, null);
    assert.equal(next.riskId, null);
    assert.equal(next.page, 1);
    assert.equal(next.kind, 'SOURCE');
  });

  it('clears risk when subtype changes', () => {
    const next = applyFrpsLibrarySubtypeChange(
      {
        riskType: 'ERG',
        riskSubTypeEnum: 'PSICOSOCIAL',
        riskSubTypeId: 1,
        riskId: 'risk-1',
        kind: null,
        status: null,
        search: '',
        page: 2,
        limit: 20,
        generalCatalog: false,
      },
      'ORGANIZACIONAIS',
      2,
    );

    assert.equal(next.riskSubTypeEnum, 'ORGANIZACIONAIS');
    assert.equal(next.riskSubTypeId, 2);
    assert.equal(next.riskId, null);
    assert.equal(next.page, 1);
  });

  it('Catálogo geral clears structural filters', () => {
    const next = applyFrpsLibraryGeneralCatalog({
      riskType: 'ERG',
      riskSubTypeEnum: 'PSICOSOCIAL',
      riskSubTypeId: null,
      riskId: null,
      kind: 'RECOMMENDATION',
      status: 'DRAFT_AI',
      search: 'prazo',
      page: 4,
      limit: 20,
      generalCatalog: false,
    });

    assert.equal(next.generalCatalog, true);
    assert.equal(next.riskType, null);
    assert.equal(next.riskSubTypeEnum, null);
    assert.equal(next.page, 1);
    assert.equal(next.kind, 'RECOMMENDATION');
    assert.equal(next.search, 'prazo');
  });
});

describe('FRPS library browse params and table mapping', () => {
  it('maps RECOMMENDATION kind and omits structural filters for generalCatalog', () => {
    const params = buildFrpsLibraryBrowseParams({
      riskType: null,
      riskSubTypeEnum: null,
      riskSubTypeId: null,
      riskId: null,
      kind: 'RECOMMENDATION',
      status: null,
      search: '',
      page: 1,
      limit: 20,
      generalCatalog: true,
    });

    assert.equal(params.kind, 'RECOMMENDATION');
    assert.equal(params.generalCatalog, true);
    assert.equal(params.riskType, undefined);
    assert.equal(params.riskSubTypeEnum, undefined);
    assert.equal(params.page, 1);
    assert.equal(params.limit, 20);
  });

  it('builds browse params for default psychosocial scope and search', () => {
    const params = buildFrpsLibraryBrowseParams({
      riskType: 'ERG',
      riskSubTypeEnum: 'PSICOSOCIAL',
      riskSubTypeId: null,
      riskId: null,
      kind: 'SOURCE',
      status: 'NEVER_GENERATED',
      search: 'prazos',
      page: 2,
      limit: 20,
      generalCatalog: false,
    });

    assert.deepEqual(params, {
      riskType: 'ERG',
      riskSubTypeEnum: 'PSICOSOCIAL',
      riskSubTypeId: undefined,
      riskId: undefined,
      kind: 'SOURCE',
      status: 'NEVER_GENERATED',
      search: 'prazos',
      page: 2,
      limit: 20,
      generalCatalog: undefined,
    });
  });

  it('maps API item to table row without content fields', () => {
    const row = mapFrpsLibraryItemToTableRow({
      systemCatalogId: 'gs-1',
      itemKey: 'catalog:SOURCE:gs-1',
      itemType: 'SOURCE',
      name: 'Pressão por prazos',
      riskId: 'risk-1',
      riskName: 'Demandas quantitativas',
      riskType: 'ERG',
      riskSubType: {
        id: 1,
        name: 'Psicossocial',
        slug: 'psicossocial',
        subTypeEnum: 'PSICOSOCIAL',
      },
      recType: null,
      conceptualStatus: 'NEVER_GENERATED',
      conceptualExplanationId: null,
      validatedByName: null,
      validatedAt: null,
      createdAt: null,
      updatedAt: null,
    });

    assert.equal(row.name, 'Pressão por prazos');
    assert.equal(row.typeLabel, 'Fonte');
    assert.equal(row.riskName, 'Demandas quantitativas');
    assert.equal(row.subtypeLabel, 'Psicossocial');
    assert.equal(row.statusLabel, 'Nunca gerado');
    assert.equal(row.updatedAtLabel, '—');
    assert.equal('content' in row, false);
  });
});
