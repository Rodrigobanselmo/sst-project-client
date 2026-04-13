export const DEFAULT_TABLE_PAGE_LIMIT = 15;

export const TABLE_PAGE_SIZE_OPTIONS = [15, 25, 50, 100] as const;

export function isAllowedTablePageLimit(n: number): boolean {
  return (TABLE_PAGE_SIZE_OPTIONS as readonly number[]).includes(n);
}
