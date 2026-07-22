import type { FrpsCatalogAdminItem } from '@v2/services/forms/frps-explainability-library';

import { getFrpsAliasSelectionBlockReason } from './frps-catalog-admin-equivalence.util';
import type { FrpsLibraryTableRow } from './frps-explainability-library-filters.util';

/**
 * Source elegível para checkbox / vinculação MASTER.
 * LOCAL ou GLOBAL (não já vinculados). GLOBAL com aliases próprios
 * permanece selecionável — a API reparenta na mesma transação.
 */
export function isFrpsLibraryAliasSelectable(row: FrpsLibraryTableRow): boolean {
  if (row.hasActiveEquivalence) return false;
  if (row.origin === 'LOCAL') return true;
  if (row.origin === 'GLOBAL') return true;
  return false;
}

/**
 * Garante composição visual: Canônico → aliases contíguos → próximo item.
 *
 * Necessário no client porque, com filtro origin GLOBAL/LOCAL, a API ordena
 * por nome (não por grupo). Aliases podem vir antes do canônico no payload.
 * Não altera a API nesta correção.
 */
export function orderFrpsLibraryRowsByEquivalenceGroups(
  rows: FrpsLibraryTableRow[],
): FrpsLibraryTableRow[] {
  if (rows.length <= 1) return rows;

  const onPageIds = new Set(rows.map((row) => row.catalogId));
  const aliasesByParent = new Map<string, FrpsLibraryTableRow[]>();
  const heads: FrpsLibraryTableRow[] = [];

  for (const row of rows) {
    const parentId = row.parentCanonicalId;
    const belongsToParentOnPage = Boolean(
      row.isAliasRow &&
        parentId &&
        onPageIds.has(parentId) &&
        !row.isOrphanAliasOnPage,
    );

    if (belongsToParentOnPage && parentId) {
      const list = aliasesByParent.get(parentId) ?? [];
      list.push(row);
      aliasesByParent.set(parentId, list);
      continue;
    }

    heads.push(row);
  }

  const ordered: FrpsLibraryTableRow[] = [];
  const emittedAliasIds = new Set<string>();

  for (const head of heads) {
    ordered.push(head);
    const children = aliasesByParent.get(head.catalogId);
    if (!children?.length) continue;
    for (const child of children) {
      ordered.push(child);
      emittedAliasIds.add(child.catalogId);
    }
  }

  // Segurança: aliases cujo pai não entrou como head (não deve ocorrer).
  for (const children of aliasesByParent.values()) {
    for (const child of children) {
      if (!emittedAliasIds.has(child.catalogId)) {
        ordered.push(child);
      }
    }
  }

  return ordered;
}

/**
 * Linhas efetivamente renderizadas: canônicos sempre; aliases só se o grupo
 * estiver expandido (órfãos de página sempre visíveis).
 * Ordem: canônico seguido imediatamente dos seus aliases (nunca acima).
 */
export function getRenderedFrpsLibraryRows(
  rows: FrpsLibraryTableRow[],
  expandedCanonicalIds: ReadonlySet<string>,
): FrpsLibraryTableRow[] {
  const ordered = orderFrpsLibraryRowsByEquivalenceGroups(rows);
  return ordered.filter((row) => {
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
 * Não inclui já vinculados ou de grupos recolhidos.
 * Inclui GLOBAL elegível (source) além de LOCAL.
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
