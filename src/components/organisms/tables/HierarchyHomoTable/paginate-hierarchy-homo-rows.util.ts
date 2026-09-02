export function paginateHierarchyHomoRows<T>(
  rows: T[],
  page: number,
  pageSize: number,
): T[] {
  if (pageSize <= 0) return [];
  const currentPage = Math.max(1, page);
  return rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
}
