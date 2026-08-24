import { normalizeInventoryItemName } from '../risk-catalog-dnd/find-risk-catalog-item-match.util';

export type ParsedRiskCatalogBulkLines = {
  items: string[];
  emptyCount: number;
  duplicateCount: number;
};

/**
 * Um item por linha. Linhas vazias são ignoradas.
 * Duplicatas (nome normalizado) na própria lista: mantém a primeira.
 */
export function parseRiskCatalogBulkLines(
  raw: string,
): ParsedRiskCatalogBulkLines {
  const lines = String(raw ?? '').split(/\r?\n/);
  let emptyCount = 0;
  const items: string[] = [];
  const seen = new Set<string>();
  let duplicateCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      emptyCount += 1;
      continue;
    }

    const key = normalizeInventoryItemName(trimmed);
    if (!key) {
      emptyCount += 1;
      continue;
    }

    if (seen.has(key)) {
      duplicateCount += 1;
      continue;
    }

    seen.add(key);
    items.push(trimmed);
  }

  return { items, emptyCount, duplicateCount };
}

export function filterNamesAlreadyLinked(
  names: string[],
  linkedNames: Array<string | null | undefined>,
): { toAdd: string[]; alreadyLinkedCount: number } {
  const linked = new Set(
    linkedNames
      .map((name) => normalizeInventoryItemName(name))
      .filter(Boolean),
  );

  const toAdd: string[] = [];
  let alreadyLinkedCount = 0;

  for (const name of names) {
    const key = normalizeInventoryItemName(name);
    if (!key) continue;
    if (linked.has(key)) {
      alreadyLinkedCount += 1;
      continue;
    }
    toAdd.push(name);
  }

  return { toAdd, alreadyLinkedCount };
}
