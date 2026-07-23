/**
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-catalog-admin-equivalence.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';
import {
  RiskCatalogKind,
  type RiskCatalogSearchItem,
} from '@v2/services/risk-catalog-equivalence/service/risk-catalog-equivalence.types';

import {
  FRPS_ADM_ENG_INCOMPATIBLE_MESSAGE,
  FRPS_ALIAS_MUST_BE_LOCAL_MESSAGE,
  FRPS_CANONICAL_MUST_BE_SYSTEM_MESSAGE,
  FRPS_EQUIVALENCE_BOTH_VALIDATED_MESSAGE,
  FRPS_EQUIVALENCE_SOURCE_VALIDATED_TARGET_MISSING_MESSAGE,
  assertNoTechnicalIdInUserCopy,
  describeConceptualComparison,
  getFrpsAliasSelectionBlockReason,
  getFrpsCanonicalSelectionBlockReason,
  getFrpsEquivalenceConceptualConflictReason,
  normalizeFrpsCatalogSearchTerm,
  resolveFrpsExactAutoSuggestedCanonical,
  resolveFrpsGlobalCandidateHint,
  resolveFrpsLibraryCanonicalLinkAction,
  shouldWarnConceptualExplanationConflict,
} from './frps-catalog-admin-equivalence.util';

function item(
  overrides: Partial<FrpsCatalogAdminItem> &
    Pick<FrpsCatalogAdminItem, 'id' | 'label' | 'origin' | 'itemType' | 'kind'>,
): FrpsCatalogAdminItem {
  return {
    recType:
      overrides.itemType === 'ENGINEERING_RECOMMENDATION'
        ? 'ENG'
        : overrides.itemType === 'ADMINISTRATIVE_RECOMMENDATION'
          ? 'ADM'
          : null,
    medType: null,
    riskId: 'risk-1',
    riskName: 'Demandas',
    riskType: 'ERG',
    riskSubType: null,
    system: overrides.origin === 'GLOBAL',
    companyId: overrides.origin === 'GLOBAL' ? 'sys' : 'company-a',
    companyName: overrides.origin === 'GLOBAL' ? 'System' : 'Empresa A',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    activeEquivalence: null,
    parentCanonicalId: null,
    isCanonical: false,
    aliasCount: 0,
    catalogUsability: 'USABLE',
    generateable: overrides.origin === 'GLOBAL',
    conceptualExplanation: {
      status: 'NEVER_GENERATED',
      explanationId: null,
      itemKey: `catalog:${overrides.itemType}:${overrides.id}`,
    },
    ...overrides,
  };
}

function searchItem(
  overrides: Partial<RiskCatalogSearchItem> &
    Pick<RiskCatalogSearchItem, 'id' | 'label'>,
): RiskCatalogSearchItem {
  return {
    kind: RiskCatalogKind.GENERATE_SOURCE,
    riskId: 'risk-1',
    riskName: 'Demandas',
    companyId: 'sys',
    companyName: 'SimpleSST',
    system: true,
    deleted_at: null,
    recType: null,
    medType: null,
    isAliasActive: false,
    canonicalId: null,
    canonicalLabel: null,
    ...overrides,
  };
}

describe('FRPS catalog admin equivalence selection', () => {
  it('allows selecting multiple compatible local aliases', () => {
    const a = item({
      id: 'local-a',
      label: 'Local A',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const b = item({
      id: 'local-b',
      label: 'Local B',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });

    assert.equal(getFrpsAliasSelectionBlockReason([], a), null);
    assert.equal(getFrpsAliasSelectionBlockReason([a], b), null);
  });

  it('allows GLOBAL source and still blocks ADM/ENG mismatch', () => {
    const global = item({
      id: 'global-1',
      label: 'Global',
      origin: 'GLOBAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    assert.equal(getFrpsAliasSelectionBlockReason([], global), null);

    const adm = item({
      id: 'adm-1',
      label: 'Adm',
      origin: 'LOCAL',
      kind: 'REC_MED',
      itemType: 'ADMINISTRATIVE_RECOMMENDATION',
    });
    const eng = item({
      id: 'eng-1',
      label: 'Eng',
      origin: 'LOCAL',
      kind: 'REC_MED',
      itemType: 'ENGINEERING_RECOMMENDATION',
    });
    assert.equal(
      getFrpsAliasSelectionBlockReason([adm], eng),
      FRPS_ADM_ENG_INCOMPATIBLE_MESSAGE,
    );
  });

  it('requires system canonical and compatible risk/kind', () => {
    const local = item({
      id: 'local-a',
      label: 'Local A',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const localCanonical = item({
      id: 'local-b',
      label: 'Local B',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const global = item({
      id: 'global-1',
      label: 'Global canônico',
      origin: 'GLOBAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });

    assert.equal(
      getFrpsCanonicalSelectionBlockReason([local], localCanonical),
      FRPS_CANONICAL_MUST_BE_SYSTEM_MESSAGE,
    );
    assert.equal(getFrpsCanonicalSelectionBlockReason([local], global), null);

    const globalA = item({
      id: 'global-a',
      label: 'Global A',
      origin: 'GLOBAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const globalB = item({
      id: 'global-b',
      label: 'Global B',
      origin: 'GLOBAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    assert.equal(getFrpsCanonicalSelectionBlockReason([globalA], globalB), null);
    assert.equal(
      getFrpsCanonicalSelectionBlockReason([globalA], localCanonical),
      FRPS_CANONICAL_MUST_BE_SYSTEM_MESSAGE,
    );
    assert.match(
      getFrpsCanonicalSelectionBlockReason([globalA], globalA) || '',
      /mesmo item/i,
    );
    assert.equal(
      resolveFrpsLibraryCanonicalLinkAction({
        origin: 'GLOBAL',
        hasActiveEquivalence: false,
        hintStatus: 'NONE',
      }),
      'SEARCH',
    );
  });
});

describe('conceptual conflict independent of catalog-admin page', () => {
  it('hard-blocks VALIDATED + VALIDATED', () => {
    const alias = item({
      id: 'global-a',
      label: 'A',
      origin: 'GLOBAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
      conceptualExplanation: {
        status: 'VALIDATED',
        explanationId: 'exp-a',
        itemKey: 'catalog:SOURCE:global-a',
      },
    });
    const canonical = {
      status: 'VALIDATED' as const,
      explanationId: 'exp-b',
      itemKey: 'catalog:SOURCE:global-b',
    };
    assert.equal(
      getFrpsEquivalenceConceptualConflictReason({
        aliases: [alias],
        canonical,
      }),
      FRPS_EQUIVALENCE_BOTH_VALIDATED_MESSAGE,
    );
    assert.equal(
      shouldWarnConceptualExplanationConflict([alias], canonical),
      false,
    );
  });

  it('hard-blocks VALIDATED source + NEVER target', () => {
    const alias = item({
      id: 'global-a',
      label: 'A',
      origin: 'GLOBAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
      conceptualExplanation: {
        status: 'VALIDATED',
        explanationId: 'exp-a',
        itemKey: 'catalog:SOURCE:global-a',
      },
    });
    assert.equal(
      getFrpsEquivalenceConceptualConflictReason({
        aliases: [alias],
        canonical: {
          status: 'NEVER_GENERATED',
          explanationId: null,
          itemKey: 'catalog:SOURCE:global-b',
        },
      }),
      FRPS_EQUIVALENCE_SOURCE_VALIDATED_TARGET_MISSING_MESSAGE,
    );
  });

  it('warns when alias and searched canonical both have explanations', () => {
    const alias = item({
      id: 'local-a',
      label: 'Local A',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
      conceptualExplanation: {
        status: 'DRAFT_AI',
        explanationId: 'exp-alias',
        itemKey: 'catalog:SOURCE:local-a',
      },
    });

    const canonicalFromSearch = {
      status: 'VALIDATED' as const,
      explanationId: 'exp-canonical',
      itemKey: 'catalog:SOURCE:global-outside-page',
    };

    assert.equal(
      shouldWarnConceptualExplanationConflict([alias], canonicalFromSearch),
      true,
    );

    const comparison = describeConceptualComparison({
      aliases: [alias],
      canonical: canonicalFromSearch,
    });
    assert.equal(comparison.conflict, true);
    assert.equal(comparison.canonicalStatusLabel, 'VALIDATED');
  });

  it('does not warn when canonical has no explanation', () => {
    const alias = item({
      id: 'local-a',
      label: 'Local A',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
      conceptualExplanation: {
        status: 'DRAFT_AI',
        explanationId: 'exp-alias',
        itemKey: 'catalog:SOURCE:local-a',
      },
    });

    const comparison = describeConceptualComparison({
      aliases: [alias],
      canonical: {
        status: 'NEVER_GENERATED',
        explanationId: null,
        itemKey: 'catalog:SOURCE:global-1',
      },
    });

    assert.equal(comparison.conflict, false);
    assert.equal(comparison.canonicalStatusLabel, 'NEVER_GENERATED');
  });

  it('does not warn when alias has no explanation and canonical has one', () => {
    const alias = item({
      id: 'local-a',
      label: 'Local A',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });

    assert.equal(
      shouldWarnConceptualExplanationConflict([alias], {
        status: 'VALIDATED',
        explanationId: 'exp-canonical',
        itemKey: 'catalog:SOURCE:global-1',
      }),
      false,
    );
  });

  it('keeps user-facing messages free of UUID patterns', () => {
    assert.equal(
      assertNoTechnicalIdInUserCopy(FRPS_ALIAS_MUST_BE_LOCAL_MESSAGE),
      true,
    );
    assert.equal(
      assertNoTechnicalIdInUserCopy(
        'item 9881ce9f-da28-4df0-ab8a-6836ce8d576a',
      ),
      false,
    );
  });
});

describe('FRPS exact auto-suggested canonical', () => {
  it('1) same normalized text, risk and type → suggests direct candidate', () => {
    const local = item({
      id: 'local-a',
      label: 'Organizar pausas cognitivas.',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const exactGlobal = searchItem({
      id: 'global-1',
      label: 'Organizar pausas cognitivas',
    });

    const suggested = resolveFrpsExactAutoSuggestedCanonical({
      aliases: [local],
      searchItems: [exactGlobal],
    });

    assert.equal(suggested?.id, 'global-1');
  });

  it('2) single contains hit with different text → does not preselect', () => {
    const local = item({
      id: 'local-a',
      label: 'Organizar pausas',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const onlyContainsHit = searchItem({
      id: 'global-1',
      label: 'Organizar pausas cognitivas regulares no trabalho',
    });

    assert.equal(
      resolveFrpsExactAutoSuggestedCanonical({
        aliases: [local],
        searchItems: [onlyContainsHit],
      }),
      null,
    );
  });

  it('3) ADM vs ENG with same text → not compatible', () => {
    const localAdm = item({
      id: 'local-adm',
      label: 'Melhorar comunicação',
      origin: 'LOCAL',
      kind: 'REC_MED',
      itemType: 'ADMINISTRATIVE_RECOMMENDATION',
    });
    const globalEng = searchItem({
      id: 'global-eng',
      label: 'Melhorar comunicação',
      kind: RiskCatalogKind.REC_MED,
      recType: 'ENG',
      medType: null,
    });

    assert.equal(
      resolveFrpsExactAutoSuggestedCanonical({
        aliases: [localAdm],
        searchItems: [globalEng],
      }),
      null,
    );
  });

  it('4) different risks with same text → not compatible', () => {
    const local = item({
      id: 'local-a',
      label: 'Pressão por prazos',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
      riskId: 'risk-a',
    });
    const otherRiskGlobal = searchItem({
      id: 'global-1',
      label: 'Pressão por prazos',
      riskId: 'risk-b',
    });

    assert.equal(
      resolveFrpsExactAutoSuggestedCanonical({
        aliases: [local],
        searchItems: [otherRiskGlobal],
      }),
      null,
    );
  });

  it('5) several exact matches → no direct card (manual search)', () => {
    const local = item({
      id: 'local-a',
      label: 'Duplicado',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });

    assert.equal(
      resolveFrpsExactAutoSuggestedCanonical({
        aliases: [local],
        searchItems: [
          searchItem({ id: 'global-1', label: 'Duplicado' }),
          searchItem({ id: 'global-2', label: 'duplicado' }),
        ],
      }),
      null,
    );
  });

  it('6) suggestion helpers never create equivalence (pure resolve)', () => {
    const local = item({
      id: 'local-a',
      label: 'Organizar pausas cognitivas',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const exactGlobal = searchItem({
      id: 'global-1',
      label: 'Organizar pausas cognitivas',
    });

    const before = structuredClone(local);
    resolveFrpsExactAutoSuggestedCanonical({
      aliases: [local],
      searchItems: [exactGlobal],
    });
    assert.deepEqual(local, before);
    assert.equal(local.activeEquivalence, null);
  });

  it('normalizes trailing punctuation for exact match seed', () => {
    assert.equal(
      normalizeFrpsCatalogSearchTerm('pausas cognitivas regulares.'),
      'pausas cognitivas regulares',
    );
  });
});

describe('FRPS list candidate hint from page items only', () => {
  it('marks exact, possible and none without per-row requests', () => {
    const exactLocal = item({
      id: 'local-exact',
      label: 'Organizar pausas cognitivas',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const possibleLocal = item({
      id: 'local-possible',
      label: 'Organizar pausas',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const noneLocal = item({
      id: 'local-none',
      label: 'Tema sem global na página',
      origin: 'LOCAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const pageGlobal = item({
      id: 'global-1',
      label: 'Organizar pausas cognitivas',
      origin: 'GLOBAL',
      kind: 'GENERATE_SOURCE',
      itemType: 'SOURCE',
    });
    const pageItems = [exactLocal, possibleLocal, noneLocal, pageGlobal];

    assert.equal(
      resolveFrpsGlobalCandidateHint(exactLocal, pageItems).status,
      'EXACT_MATCH',
    );
    assert.equal(
      resolveFrpsGlobalCandidateHint(possibleLocal, pageItems).status,
      'POSSIBLE_CANDIDATES',
    );
    assert.equal(
      resolveFrpsGlobalCandidateHint(noneLocal, pageItems).status,
      'NONE',
    );
  });

  it('7) hint resolution is O(page items) — no extra fetch contract', () => {
    // Documentação contratual do client: a página usa 1 browse catalog-admin
    // e calcula hints com data.items (sem browse/search por linha).
    const locals = Array.from({ length: 12 }, (_, index) =>
      item({
        id: `local-${index}`,
        label: `Item local ${index}`,
        origin: 'LOCAL',
        kind: 'GENERATE_SOURCE',
        itemType: 'SOURCE',
      }),
    );
    const pageItems = [
      ...locals,
      item({
        id: 'global-1',
        label: 'Item local 3',
        origin: 'GLOBAL',
        kind: 'GENERATE_SOURCE',
        itemType: 'SOURCE',
      }),
    ];

    const hints = locals.map((local) =>
      resolveFrpsGlobalCandidateHint(local, pageItems),
    );
    assert.equal(hints.length, 12);
    assert.equal(hints[3].status, 'EXACT_MATCH');
    assert.equal(
      hints.filter((hint) => hint.status === 'NONE').length,
      11,
    );
  });
});
