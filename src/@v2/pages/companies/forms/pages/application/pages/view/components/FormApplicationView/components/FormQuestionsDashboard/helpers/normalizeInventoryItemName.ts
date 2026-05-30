export function normalizeInventoryItemName(
  name: string | undefined | null,
): string {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}
