/**
 * Testes pontuais dos filtros/URL da Biblioteca FRPS (consulta admin).
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

const baseFilters = {
  riskType: 'ERG' as string | null,
  riskSubTypeEnum: 'PSICOSOCIAL' as string | null,
  riskSubTypeId: 1 as number | null,
  riskId: 'risk-1' as string | null,
  catalogType: 'SOURCE' as const,
  origin: 'ALL' as const,
  companyId: null as string | null,
  status: null as null,
  hasExplanation: null as boolean | null,
  hasEquivalence: null as boolean | null,
  search: '',
  page: 3,
  limit: 15,
  generalCatalog: false,
};

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
    assert.equal(filters.origin, 'ALL');

    const serialized = serializeFrpsLibraryFiltersToQuery(filters);
    assert.equal(serialized.riskType, 'ERG');
    assert.equal(serialized.riskSubTypeEnum, 'PSICOSOCIAL');
    assert.equal(serialized.page, '1');
  });
});

describe('FRPS library hierarchical filters', () => {
  it('clears subtype and risk when category changes', () => {
    const next = applyFrpsLibraryCategoryChange(baseFilters, 'FIS');

    assert.equal(next.riskType, 'FIS');
    assert.equal(next.riskSubTypeEnum, null);
    assert.equal(next.riskSubTypeId, null);
    assert.equal(next.riskId, null);
    assert.equal(next.page, 1);
    assert.equal(next.catalogType, 'SOURCE');
  });

  it('clears risk when subtype changes', () => {
    const next = applyFrpsLibrarySubtypeChange(
      { ...baseFilters, catalogType: null, page: 2 },
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
      ...baseFilters,
      catalogType: 'ADM',
      status: 'DRAFT_AI',
      search: 'prazo',
      page: 4,
    });

    assert.equal(next.generalCatalog, true);
    assert.equal(next.riskType, null);
    assert.equal(next.riskSubTypeEnum, null);
    assert.equal(next.page, 1);
    assert.equal(next.catalogType, 'ADM');
    assert.equal(next.search, 'prazo');
  });

  it('parses origin, company, explanation and equivalence filters', () => {
    const filters = parseFrpsLibraryFiltersFromQuery({
      origin: 'LOCAL',
      companyId: 'company-a',
      catalogType: 'ENG',
      hasExplanation: 'true',
      hasEquivalence: 'false',
    });

    assert.equal(filters.origin, 'LOCAL');
    assert.equal(filters.companyId, 'company-a');
    assert.equal(filters.catalogType, 'ENG');
    assert.equal(filters.hasExplanation, true);
    assert.equal(filters.hasEquivalence, false);
  });
});

describe('FRPS library browse params and table mapping', () => {
  it('maps catalogType and omits structural filters for generalCatalog', () => {
    const params = buildFrpsLibraryBrowseParams({
      ...baseFilters,
      riskType: null,
      riskSubTypeEnum: null,
      riskSubTypeId: null,
      riskId: null,
      catalogType: 'ADM',
      page: 1,
      generalCatalog: true,
    });

    assert.equal(params.catalogType, 'ADM');
    assert.equal(params.generalCatalog, true);
    assert.equal(params.riskType, undefined);
    assert.equal(params.riskSubTypeEnum, undefined);
    assert.equal(params.page, 1);
    assert.equal(params.limit, 15);
  });

  it('builds browse params for default psychosocial scope and search', () => {
    const params = buildFrpsLibraryBrowseParams({
      ...baseFilters,
      riskSubTypeId: null,
      riskId: null,
      catalogType: 'SOURCE',
      status: 'NEVER_GENERATED',
      search: 'prazos',
      page: 2,
      origin: 'LOCAL',
      hasEquivalence: false,
    });

    assert.deepEqual(params, {
      riskType: 'ERG',
      riskSubTypeEnum: 'PSICOSOCIAL',
      riskSubTypeId: undefined,
      riskId: undefined,
      catalogType: 'SOURCE',
      origin: 'LOCAL',
      companyId: undefined,
      status: 'NEVER_GENERATED',
      hasExplanation: undefined,
      hasEquivalence: false,
      search: 'prazos',
      page: 2,
      limit: 15,
      generalCatalog: undefined,
    });
  });

  it('maps API admin item to table row without exposing UUID as primary label', () => {
    const row = mapFrpsLibraryItemToTableRow({
      id: 'gs-1',
      label: 'Pressão por prazos',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
      recType: null,
      medType: null,
      riskId: 'risk-1',
      riskName: 'Demandas quantitativas',
      riskType: 'ERG',
      riskSubType: {
        id: 1,
        name: 'Psicossocial',
        slug: 'psicossocial',
        subTypeEnum: 'PSICOSOCIAL',
      },
      system: true,
      companyId: 'company-system',
      companyName: 'System Co',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      origin: 'GLOBAL',
      activeEquivalence: null,
      parentCanonicalId: null,
      isCanonical: false,
      aliasCount: 0,
      catalogUsability: 'USABLE',
      generateable: true,
      conceptualExplanation: {
        status: 'NEVER_GENERATED',
        explanationId: null,
        itemKey: 'catalog:SOURCE:gs-1',
      },
    });

    assert.equal(row.id, 'SOURCE:gs-1');
    assert.equal(row.catalogId, 'gs-1');
    assert.equal(row.name, 'Pressão por prazos');
    assert.equal(row.originLabel, 'Global');
    assert.equal(row.companyName, 'SimpleSST');
    assert.equal(row.globalCandidateHint.status, 'NONE');
    assert.equal(row.equivalenceLabel, 'Sem equivalência');
    assert.equal(row.typeLabel, 'Fonte');
    assert.equal(row.statusLabel, 'Nunca gerado');
    assert.equal(row.generateable, true);
    assert.equal(row.isInvalidSystemReference, false);
    assert.match(row.name, /Pressão/);
    assert.doesNotMatch(row.name, /[0-9a-f-]{36}/i);
  });

  it('maps INVALID_SYSTEM_REFERENCE to chip label and not generateable', () => {
    const row = mapFrpsLibraryItemToTableRow({
      id: 'rec-med-only',
      label: 'Medida só medType',
      kind: 'REC_MED',
      itemType: 'ADMINISTRATIVE_RECOMMENDATION',
      recType: null,
      medType: 'ADM',
      riskId: 'risk-1',
      riskName: 'Demandas',
      riskType: 'ERG',
      riskSubType: null,
      system: true,
      companyId: 'sys',
      companyName: 'System',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      origin: 'GLOBAL',
      activeEquivalence: null,
      parentCanonicalId: null,
      isCanonical: false,
      aliasCount: 0,
      catalogUsability: 'INVALID_SYSTEM_REFERENCE',
      generateable: false,
      conceptualExplanation: {
        status: 'NEVER_GENERATED',
        explanationId: null,
        itemKey: 'catalog:ADMINISTRATIVE_RECOMMENDATION:rec-med-only',
      },
    });

    assert.equal(row.statusLabel, 'Referência global inválida');
    assert.equal(row.generateable, false);
    assert.equal(row.isInvalidSystemReference, true);
    assert.equal(row.catalogUsability, 'INVALID_SYSTEM_REFERENCE');
  });

  it('labels canonical with alias count and orphan alias context', () => {
    const canonical = mapFrpsLibraryItemToTableRow({
      id: 'gs-canonical',
      label: 'Canônico longo',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
      recType: null,
      medType: null,
      riskId: 'risk-1',
      riskName: 'Demandas',
      riskType: 'ERG',
      riskSubType: null,
      system: true,
      companyId: 'sys',
      companyName: 'System',
      status: 'ACTIVE',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-02T00:00:00.000Z',
      origin: 'GLOBAL',
      activeEquivalence: null,
      parentCanonicalId: null,
      isCanonical: true,
      aliasCount: 2,
      catalogUsability: 'USABLE',
      generateable: true,
      conceptualExplanation: {
        status: 'NEVER_GENERATED',
        explanationId: null,
        itemKey: 'catalog:SOURCE:gs-canonical',
      },
    });
    assert.equal(canonical.equivalenceLabel, 'Canônico · 2 aliases');
    assert.equal(canonical.isCanonical, true);

    const orphan = mapFrpsLibraryItemToTableRow(
      {
        id: 'gs-local',
        label: 'Local curto',
        kind: 'GENERATE_SOURCE',
        itemType: 'SOURCE',
        recType: null,
        medType: null,
        riskId: 'risk-1',
        riskName: 'Demandas',
        riskType: 'ERG',
        riskSubType: null,
        system: false,
        companyId: 'c1',
        companyName: 'C1',
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z',
        origin: 'LOCAL',
        activeEquivalence: {
          equivalenceId: 'eq-1',
          canonicalId: 'gs-canonical',
          canonicalLabel: 'Canônico longo',
          equivalenceType: 'SEMANTIC_ALIAS',
        },
        parentCanonicalId: 'gs-canonical',
        isCanonical: false,
        aliasCount: 0,
        catalogUsability: 'USABLE',
        generateable: false,
        conceptualExplanation: {
          status: 'NEVER_GENERATED',
          explanationId: null,
          itemKey: 'catalog:SOURCE:gs-local',
        },
      },
      { canonicalIdsOnPage: new Set() },
    );
    assert.equal(orphan.equivalenceLabel, 'Alias → Canônico longo');
    assert.equal(orphan.isOrphanAliasOnPage, true);
    assert.equal(orphan.canonicalLabel, 'Canônico longo');
  });
});
