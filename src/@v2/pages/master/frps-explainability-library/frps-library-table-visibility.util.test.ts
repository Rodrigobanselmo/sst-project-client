/**
 * Executar: npx tsx --test src/@v2/pages/master/frps-explainability-library/frps-library-table-visibility.util.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';

import type { FrpsLibraryTableRow } from './frps-explainability-library-filters.util';
import {
  areAllVisibleSelectableSelected,
  buildFrpsAliasGroupToggleLabel,
  buildFrpsSelectVisibleButtonLabel,
  deselectVisibleSelectableAliases,
  getAutoExpandCanonicalIdsForSearch,
  getRenderedFrpsLibraryRows,
  getVisibleSelectableAliasRows,
  isFrpsLibraryAliasSelectable,
  orderFrpsLibraryRowsByEquivalenceGroups,
  selectVisibleSelectableAliases,
} from './frps-library-table-visibility.util';

function assertContiguousGroup(
  rendered: FrpsLibraryTableRow[],
  canonicalId: string,
  aliasIds: string[],
) {
  const canonIndex = rendered.findIndex((r) => r.catalogId === canonicalId);
  assert.ok(canonIndex >= 0, `canonical ${canonicalId} missing`);
  for (let i = 0; i < aliasIds.length; i += 1) {
    assert.equal(
      rendered[canonIndex + 1 + i]?.catalogId,
      aliasIds[i],
      `alias ${aliasIds[i]} must sit contiguous under ${canonicalId}`,
    );
  }
  for (let i = 0; i < canonIndex; i += 1) {
    assert.notEqual(
      rendered[i]?.parentCanonicalId,
      canonicalId,
      'no alias of this canonical may appear above it',
    );
  }
}

function item(
  overrides: Partial<FrpsCatalogAdminItem> &
    Pick<FrpsCatalogAdminItem, 'id' | 'origin'>,
): FrpsCatalogAdminItem {
  const itemType = overrides.itemType ?? 'ADMINISTRATIVE_RECOMMENDATION';
  return {
    label: overrides.label ?? overrides.id,
    kind: 'REC_MED',
    itemType,
    recType:
      itemType === 'ENGINEERING_RECOMMENDATION'
        ? 'ENG'
        : itemType === 'ADMINISTRATIVE_RECOMMENDATION'
          ? 'ADM'
          : null,
    medType: null,
    riskId: 'risk-1',
    riskName: 'Risco',
    riskType: 'ERG',
    riskSubType: null,
    system: overrides.origin === 'GLOBAL',
    companyId: overrides.origin === 'GLOBAL' ? 'sys' : 'company-1',
    companyName: overrides.origin === 'GLOBAL' ? 'SimpleSST' : 'Empresa',
    status: 'ACTIVE',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    activeEquivalence: null,
    parentCanonicalId: null,
    isCanonical: false,
    aliasCount: 0,
    conceptualExplanation: {
      status: 'NEVER_GENERATED',
      explanationId: null,
      itemKey: `catalog:${itemType}:${overrides.id}`,
    },
    ...overrides,
  };
}

function row(
  partial: Partial<FrpsLibraryTableRow> &
    Pick<FrpsLibraryTableRow, 'catalogId' | 'origin'>,
): FrpsLibraryTableRow {
  const catalogId = partial.catalogId;
  const origin = partial.origin;
  const raw =
    partial.raw ??
    item({
      id: catalogId,
      origin,
      isCanonical: partial.isCanonical,
      activeEquivalence: partial.hasActiveEquivalence
        ? {
            equivalenceId: 'eq-1',
            canonicalId: 'canon-1',
            canonicalLabel: 'Canônico',
            equivalenceType: 'SEMANTIC_ALIAS',
          }
        : null,
      parentCanonicalId: partial.parentCanonicalId,
      aliasCount: partial.aliasCount,
    });

  return {
    id: `${partial.itemType ?? 'ADMINISTRATIVE_RECOMMENDATION'}:${catalogId}`,
    catalogId,
    itemType: partial.itemType ?? 'ADMINISTRATIVE_RECOMMENDATION',
    kind: partial.kind ?? 'REC_MED',
    conceptualExplanationId: partial.conceptualExplanationId ?? null,
    name: partial.name ?? catalogId,
    typeLabel: partial.typeLabel ?? 'Administrativa',
    riskName: partial.riskName ?? 'Risco',
    subtypeLabel: partial.subtypeLabel ?? '—',
    origin,
    originLabel: origin === 'GLOBAL' ? 'Global' : 'Local',
    companyName: partial.companyName ?? 'Empresa',
    status: partial.status ?? 'NEVER_GENERATED',
    statusLabel: partial.statusLabel ?? 'Nunca gerado',
    equivalenceLabel: partial.equivalenceLabel ?? 'Sem equivalência',
    hasActiveEquivalence: partial.hasActiveEquivalence ?? false,
    isCanonical: partial.isCanonical ?? false,
    isAliasRow: partial.isAliasRow ?? false,
    isOrphanAliasOnPage: partial.isOrphanAliasOnPage ?? false,
    aliasCount: partial.aliasCount ?? 0,
    parentCanonicalId: partial.parentCanonicalId ?? null,
    canonicalLabel: partial.canonicalLabel ?? null,
    globalCandidateHint: partial.globalCandidateHint ?? {
      status: 'NONE',
      count: 0,
      sampleLabel: null,
    },
    updatedAtLabel: partial.updatedAtLabel ?? '—',
    raw,
  };
}

describe('frps-library-table-visibility', () => {
  const canonical = row({
    catalogId: 'canon-1',
    origin: 'GLOBAL',
    isCanonical: true,
    aliasCount: 28,
  });

  const selectableAliases = Array.from({ length: 28 }, (_, index) =>
    row({
      catalogId: `alias-${index + 1}`,
      origin: 'LOCAL',
      isAliasRow: true,
      parentCanonicalId: 'canon-1',
      hasActiveEquivalence: false,
    }),
  );

  const linkedAlias = row({
    catalogId: 'alias-linked',
    origin: 'LOCAL',
    isAliasRow: true,
    parentCanonicalId: 'canon-1',
    hasActiveEquivalence: true,
  });

  it('1-3) collapsed group hides aliases; expanded shows them under canonical', () => {
    const all = [canonical, ...selectableAliases, linkedAlias];
    const collapsed = getRenderedFrpsLibraryRows(all, new Set());
    assert.equal(collapsed.length, 1);
    assert.equal(collapsed[0]?.catalogId, 'canon-1');

    const expanded = getRenderedFrpsLibraryRows(all, new Set(['canon-1']));
    assert.equal(expanded.length, 30);
    assert.equal(expanded[0]?.catalogId, 'canon-1');
    assert.equal(expanded[1]?.catalogId, 'alias-1');
  });

  it('4) select visible picks 28 local aliases + GLOBAL source', () => {
    const rendered = getRenderedFrpsLibraryRows(
      [canonical, ...selectableAliases, linkedAlias],
      new Set(['canon-1']),
    );
    const visible = getVisibleSelectableAliasRows(rendered);
    assert.equal(visible.length, 29);
    assert.ok(visible.some((item) => item.catalogId === 'canon-1'));
    assert.equal(
      visible.filter((item) => item.catalogId.startsWith('alias-')).length,
      28,
    );

    const { nextSelected, addedCount } = selectVisibleSelectableAliases({
      visibleSelectable: visible,
      selectedLocals: [],
    });
    assert.equal(addedCount, 29);
    assert.equal(nextSelected.length, 29);
  });

  it('5) GLOBAL without active equivalence is selectable as source', () => {
    assert.equal(isFrpsLibraryAliasSelectable(canonical), true);
  });

  it('6) already-linked alias is not selectable', () => {
    assert.equal(isFrpsLibraryAliasSelectable(linkedAlias), false);
  });

  it('7) collapsed groups hide aliases; GLOBAL head remains selectable', () => {
    const rendered = getRenderedFrpsLibraryRows(
      [canonical, ...selectableAliases],
      new Set(),
    );
    const visible = getVisibleSelectableAliasRows(rendered);
    assert.equal(visible.length, 1);
    assert.equal(visible[0]?.catalogId, 'canon-1');
  });

  it('8) filters reduce selectable set to rendered page rows only', () => {
    const pageSlice = selectableAliases.slice(0, 5);
    const rendered = getRenderedFrpsLibraryRows(
      [canonical, ...pageSlice],
      new Set(['canon-1']),
    );
    // 5 LOCAL aliases + 1 GLOBAL source
    assert.equal(getVisibleSelectableAliasRows(rendered).length, 6);
  });

  it('9) deselect visible keeps selections from other pages', () => {
    const otherPage = item({ id: 'alias-other-page', origin: 'LOCAL' });
    const rendered = getRenderedFrpsLibraryRows(
      [canonical, ...selectableAliases.slice(0, 2)],
      new Set(['canon-1']),
    );
    const visible = getVisibleSelectableAliasRows(rendered);
    const selected = [otherPage, ...visible.map((entry) => entry.raw)];
    const next = deselectVisibleSelectableAliases({
      visibleSelectable: visible,
      selectedLocals: selected,
    });
    assert.deepEqual(
      next.map((entry) => entry.id),
      ['alias-other-page'],
    );
  });

  it('toggle label and all-selected detection', () => {
    assert.equal(
      buildFrpsSelectVisibleButtonLabel(false),
      'Selecionar visíveis',
    );
    assert.equal(
      buildFrpsSelectVisibleButtonLabel(true),
      'Desmarcar visíveis',
    );

    const visible = selectableAliases.slice(0, 2);
    assert.equal(
      areAllVisibleSelectableSelected({
        visibleSelectable: visible,
        selectedIds: new Set(['alias-1', 'alias-2']),
      }),
      true,
    );
    assert.equal(
      areAllVisibleSelectableSelected({
        visibleSelectable: visible,
        selectedIds: new Set(['alias-1']),
      }),
      false,
    );
  });

  it('search auto-expands only groups with alias hits', () => {
    const ids = getAutoExpandCanonicalIdsForSearch({
      rows: [canonical, selectableAliases[0]!],
      search: 'pausas',
    });
    assert.deepEqual([...ids], ['canon-1']);

    const empty = getAutoExpandCanonicalIdsForSearch({
      rows: [canonical, selectableAliases[0]!],
      search: '',
    });
    assert.equal(empty.size, 0);
  });

  it('group toggle label markers', () => {
    assert.equal(
      buildFrpsAliasGroupToggleLabel({ aliasCount: 49, expanded: false }),
      '▶ 49 aliases',
    );
    assert.equal(
      buildFrpsAliasGroupToggleLabel({ aliasCount: 1, expanded: true }),
      '▼ 1 alias',
    );
  });
});

describe('frps-library row order (GLOBAL filter / reparent regression)', () => {
  const aliasRow = (
    catalogId: string,
    parentCanonicalId: string,
    name: string,
  ) =>
    row({
      catalogId,
      name,
      origin: 'GLOBAL',
      isAliasRow: true,
      parentCanonicalId,
      hasActiveEquivalence: true,
    });

  it('1) canonical first on page + expanded: aliases below, never above', () => {
    // Payload as API name-sort with origin=GLOBAL: shorter "Ajustar…" aliases
    // before the longer canonical label.
    const disordered = [
      aliasRow('alias-short', 'canon-b', 'Ajustar metas e prazos'),
      row({
        catalogId: 'canon-b',
        name: 'Ajustar metas e prazos conforme a complexidade',
        origin: 'GLOBAL',
        isCanonical: true,
        aliasCount: 2,
      }),
      aliasRow('alias-estima', 'canon-b', 'Estimula a revisão'),
      row({
        catalogId: 'solo-z',
        name: 'Zona solo',
        origin: 'GLOBAL',
      }),
    ];

    const rendered = getRenderedFrpsLibraryRows(
      disordered,
      new Set(['canon-b']),
    );

    assert.equal(rendered[0]?.catalogId, 'canon-b');
    assertContiguousGroup(rendered, 'canon-b', ['alias-short', 'alias-estima']);
    assert.equal(rendered[3]?.catalogId, 'solo-z');
  });

  it('2) canonical mid-list: aliases contiguous immediately below', () => {
    const disordered = [
      row({ catalogId: 'solo-a', name: 'Alpha solo', origin: 'GLOBAL' }),
      aliasRow('a1', 'canon-m', 'Alias mid 1'),
      row({ catalogId: 'solo-c', name: 'Charlie solo', origin: 'GLOBAL' }),
      row({
        catalogId: 'canon-m',
        name: 'Mid canonical',
        origin: 'GLOBAL',
        isCanonical: true,
        aliasCount: 2,
      }),
      aliasRow('a2', 'canon-m', 'Alias mid 2'),
    ];

    const rendered = getRenderedFrpsLibraryRows(
      disordered,
      new Set(['canon-m']),
    );
    assertContiguousGroup(rendered, 'canon-m', ['a1', 'a2']);
    assert.deepEqual(
      rendered.map((r) => r.catalogId),
      ['solo-a', 'solo-c', 'canon-m', 'a1', 'a2'],
    );
  });

  it('3) collapsed: aliases not rendered', () => {
    const disordered = [
      aliasRow('a1', 'canon-1', 'Alias 1'),
      row({
        catalogId: 'canon-1',
        origin: 'GLOBAL',
        isCanonical: true,
        aliasCount: 1,
      }),
    ];
    const collapsed = getRenderedFrpsLibraryRows(disordered, new Set());
    assert.deepEqual(
      collapsed.map((r) => r.catalogId),
      ['canon-1'],
    );
  });

  it('4) two expanded canonicals: each alias set stays with own parent', () => {
    const disordered = [
      aliasRow('b1', 'canon-b', 'B alias'),
      aliasRow('a1', 'canon-a', 'A alias'),
      row({
        catalogId: 'canon-b',
        name: 'Canon B',
        origin: 'GLOBAL',
        isCanonical: true,
        aliasCount: 1,
      }),
      row({
        catalogId: 'canon-a',
        name: 'Canon A',
        origin: 'GLOBAL',
        isCanonical: true,
        aliasCount: 1,
      }),
    ];

    const rendered = getRenderedFrpsLibraryRows(
      disordered,
      new Set(['canon-a', 'canon-b']),
    );
    assertContiguousGroup(rendered, 'canon-b', ['b1']);
    assertContiguousGroup(rendered, 'canon-a', ['a1']);
    assert.deepEqual(
      rendered.map((r) => r.catalogId),
      ['canon-b', 'b1', 'canon-a', 'a1'],
    );
  });

  it('5) reparent: new canonical followed by all reparented aliases incl. source GLOBAL', () => {
    // After A→B with prior X,Y→A: page may still arrive name-sorted / stale positions.
    const disordered = [
      aliasRow('source-a', 'canon-b', 'Estimula A (ex-canônico)'),
      aliasRow('x', 'canon-b', 'Alias X reparentado'),
      row({
        catalogId: 'other',
        name: 'Outro item',
        origin: 'GLOBAL',
      }),
      row({
        catalogId: 'canon-b',
        name: 'Canônico B final',
        origin: 'GLOBAL',
        isCanonical: true,
        aliasCount: 3,
      }),
      aliasRow('y', 'canon-b', 'Alias Y reparentado'),
    ];

    const ordered = orderFrpsLibraryRowsByEquivalenceGroups(disordered);
    assert.deepEqual(
      ordered.map((r) => r.catalogId),
      ['other', 'canon-b', 'source-a', 'x', 'y'],
    );

    const rendered = getRenderedFrpsLibraryRows(
      disordered,
      new Set(['canon-b']),
    );
    assertContiguousGroup(rendered, 'canon-b', ['source-a', 'x', 'y']);
    assert.ok(
      !rendered.some(
        (r, index) =>
          r.parentCanonicalId === 'canon-b' &&
          index < rendered.findIndex((x) => x.catalogId === 'canon-b'),
      ),
      'no reparented alias remains above / in old position before B',
    );
  });

  it('6) pagination first row: expanded aliases stay after canonical (not under sticky slot)', () => {
    const page = [
      aliasRow('hidden-above', 'canon-first', 'AAA alias sorts first by name'),
      row({
        catalogId: 'canon-first',
        name: 'BBB canonical first visual row',
        origin: 'GLOBAL',
        isCanonical: true,
        aliasCount: 1,
      }),
      row({
        catalogId: 'next',
        name: 'CCC next',
        origin: 'GLOBAL',
      }),
    ];
    const rendered = getRenderedFrpsLibraryRows(
      page,
      new Set(['canon-first']),
    );
    assert.equal(rendered[0]?.catalogId, 'canon-first');
    assert.equal(rendered[1]?.catalogId, 'hidden-above');
    assert.equal(rendered[2]?.catalogId, 'next');
  });

  it('7) row keys unique after reorder', () => {
    const disordered = [
      aliasRow('a1', 'c1', 'A1'),
      row({
        catalogId: 'c1',
        origin: 'GLOBAL',
        isCanonical: true,
        aliasCount: 1,
        itemType: 'ADMINISTRATIVE_RECOMMENDATION',
      }),
      aliasRow('a1-dup-check', 'c1', 'A2'),
    ];
    // Force same id shape as table (`itemType:catalogId`)
    disordered[2] = {
      ...disordered[2]!,
      id: 'ADMINISTRATIVE_RECOMMENDATION:a1-dup-check',
    };

    const rendered = getRenderedFrpsLibraryRows(disordered, new Set(['c1']));
    const keys = rendered.map((r) => r.id);
    assert.equal(keys.length, new Set(keys).size);
    assert.deepEqual(keys, [
      'ADMINISTRATIVE_RECOMMENDATION:c1',
      'ADMINISTRATIVE_RECOMMENDATION:a1',
      'ADMINISTRATIVE_RECOMMENDATION:a1-dup-check',
    ]);
  });
});
