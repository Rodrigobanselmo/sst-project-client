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
  selectVisibleSelectableAliases,
} from './frps-library-table-visibility.util';

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

  it('4) select visible picks 28 eligible aliases; not canonical', () => {
    const rendered = getRenderedFrpsLibraryRows(
      [canonical, ...selectableAliases, linkedAlias],
      new Set(['canon-1']),
    );
    const visible = getVisibleSelectableAliasRows(rendered);
    assert.equal(visible.length, 28);
    assert.ok(visible.every((item) => item.catalogId.startsWith('alias-')));
    assert.ok(!visible.some((item) => item.isCanonical));

    const { nextSelected, addedCount } = selectVisibleSelectableAliases({
      visibleSelectable: visible,
      selectedLocals: [],
    });
    assert.equal(addedCount, 28);
    assert.equal(nextSelected.length, 28);
  });

  it('5) canonical is never selectable', () => {
    assert.equal(isFrpsLibraryAliasSelectable(canonical), false);
  });

  it('6) already-linked alias is not selectable', () => {
    assert.equal(isFrpsLibraryAliasSelectable(linkedAlias), false);
  });

  it('7) collapsed groups are excluded from select-visible', () => {
    const rendered = getRenderedFrpsLibraryRows(
      [canonical, ...selectableAliases],
      new Set(),
    );
    assert.equal(getVisibleSelectableAliasRows(rendered).length, 0);
  });

  it('8) filters reduce selectable set to rendered page rows only', () => {
    const pageSlice = selectableAliases.slice(0, 5);
    const rendered = getRenderedFrpsLibraryRows(
      [canonical, ...pageSlice],
      new Set(['canon-1']),
    );
    assert.equal(getVisibleSelectableAliasRows(rendered).length, 5);
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
