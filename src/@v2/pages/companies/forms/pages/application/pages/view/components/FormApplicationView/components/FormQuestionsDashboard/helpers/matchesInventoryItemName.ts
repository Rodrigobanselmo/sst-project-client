import { normalizeInventoryItemName } from './normalizeInventoryItemName';

const MIN_PREFIX_MATCH_LENGTH = 24;

/** Só trata como match quando o inventário parece nome truncado (mais curto). */
function isPrefixMatch(itemName: string, inventoryName: string) {
  if (!itemName || !inventoryName) return false;
  if (inventoryName.length >= itemName.length) return false;
  if (inventoryName.length < MIN_PREFIX_MATCH_LENGTH) return false;
  return itemName.startsWith(inventoryName);
}

/** Compara nome de item de IA com nome persistido no inventário/catálogo. */
export function matchesInventoryItemName(
  itemName: string,
  inventoryName: string,
): boolean {
  const normalizedItem = normalizeInventoryItemName(itemName);
  const normalizedInventory = normalizeInventoryItemName(inventoryName);
  if (!normalizedItem || !normalizedInventory) return false;
  if (normalizedItem === normalizedInventory) return true;
  return isPrefixMatch(normalizedItem, normalizedInventory);
}

export function inventorySetHasItemName(
  inventoryNames: Set<string>,
  itemName: string,
): boolean {
  const normalizedItem = normalizeInventoryItemName(itemName);
  if (!normalizedItem) return false;
  if (inventoryNames.has(normalizedItem)) return true;

  for (const inventoryName of inventoryNames) {
    if (matchesInventoryItemName(itemName, inventoryName)) return true;
  }

  return false;
}
