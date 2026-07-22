import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';

import { getFrpsAliasSelectionBlockReason } from './frps-catalog-admin-equivalence.util';
import type { FrpsLibraryTableRow } from './frps-explainability-library-filters.util';

/** Alias local elegível para checkbox / vinculação MASTER. */
export function isFrpsLibraryAliasSelectable(row: FrpsLibraryTableRow): boolean {
  return row.origin === 'LOCAL' && !row.hasActiveEquivalence && !row.isCanonical;
}

/**
 * Linhas efetivamente renderizadas: canônicos sempre; aliases só se o grupo
 * estiver expandido (órfãos de página sempre visíveis).
 */
export function getRenderedFrpsLibraryRows(
  rows: FrpsLibraryTableRow[],
  expandedCanonicalIds: ReadonlySet<string>,
): FrpsLibraryTableRow[] {
  return rows.filter((row) => {
    if (!row.isAliasRow) return true;
    if (row.isOrphanAliasOnPage) return true;
    if (!row.parentCanonicalId) return true;
    return expandedCanonicalIds.has(row.parentCanonicalId);
  });
}

/** Aliases elegíveis entre as linhas atualmente renderizadas. */
export function getVisibleSelectableAliasRows(
  renderedRows: FrpsLibraryTableRow[],
): FrpsLibraryTableRow[] {
  return renderedRows.filter(isFrpsLibraryAliasSelectable);
}

export function buildFrpsSelectVisibleButtonLabel(
  allVisibleEligibleSelected: boolean,
): string {
  return allVisibleEligibleSelected
    ? 'Desmarcar visíveis'
    : 'Selecionar visíveis';
}

export function areAllVisibleSelectableSelected(params: {
  visibleSelectable: FrpsLibraryTableRow[];
  selectedIds: ReadonlySet<string>;
}): boolean {
  const { visibleSelectable, selectedIds } = params;
  if (!visibleSelectable.length) return false;
  return visibleSelectable.every((row) => selectedIds.has(row.catalogId));
}

/**
 * Seleciona aliases elegíveis renderizados (página + filtros + grupos abertos),
 * respeitando incompatibilidade com a seleção já existente.
 * Não inclui canônico, global, já vinculado ou de grupos recolhidos.
 */
export function selectVisibleSelectableAliases(params: {
  visibleSelectable: FrpsLibraryTableRow[];
  selectedLocals: FrpsCatalogAdminItem[];
}): {
  nextSelected: FrpsCatalogAdminItem[];
  addedCount: number;
  skippedCount: number;
} {
  let next = [...params.selectedLocals];
  const selectedIds = new Set(next.map((item) => item.id));
  let addedCount = 0;
  let skippedCount = 0;

  for (const row of params.visibleSelectable) {
    if (selectedIds.has(row.catalogId)) continue;
    const blockReason = getFrpsAliasSelectionBlockReason(next, row.raw);
    if (blockReason) {
      skippedCount += 1;
      continue;
    }
    next = [...next, row.raw];
    selectedIds.add(row.catalogId);
    addedCount += 1;
  }

  return { nextSelected: next, addedCount, skippedCount };
}

/**
 * Remove da seleção global apenas os elegíveis atualmente renderizados.
 * Mantém seleções de outras páginas / grupos não visíveis.
 */
export function deselectVisibleSelectableAliases(params: {
  visibleSelectable: FrpsLibraryTableRow[];
  selectedLocals: FrpsCatalogAdminItem[];
}): FrpsCatalogAdminItem[] {
  const visibleIds = new Set(
    params.visibleSelectable.map((row) => row.catalogId),
  );
  return params.selectedLocals.filter((item) => !visibleIds.has(item.id));
}

/**
 * Grupos a expandir automaticamente quando busca/filtro devolve aliases
 * que estariam ocultos em grupos recolhidos.
 */
export function getAutoExpandCanonicalIdsForSearch(params: {
  rows: FrpsLibraryTableRow[];
  search: string;
}): Set<string> {
  const search = params.search.trim();
  if (!search) return new Set();

  const next = new Set<string>();
  for (const row of params.rows) {
    if (row.isAliasRow && row.parentCanonicalId && !row.isOrphanAliasOnPage) {
      next.add(row.parentCanonicalId);
    }
  }
  return next;
}

export function buildFrpsAliasGroupToggleLabel(params: {
  aliasCount: number;
  expanded: boolean;
}): string {
  const n = params.aliasCount;
  const noun = n === 1 ? 'alias' : 'aliases';
  const marker = params.expanded ? '▼' : '▶';
  return `${marker} ${n} ${noun}`;
}
