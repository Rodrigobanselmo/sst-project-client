import sortArray from 'sort-array';

/**
 * React Query (and similar caches) may freeze hierarchy payloads.
 * `sort-array` mutates in place — always copy before sorting.
 */
export function sortHierarchyChildIds<T extends string | number>(
  children: readonly T[] | null | undefined,
  getName: (id: T) => string,
): T[] {
  return sortArray([...(children ?? [])], {
    by: 'name',
    order: 'asc',
    computed: {
      name: (row: T) => getName(row) || '',
    },
  }) as T[];
}

export function sortIdsByLabel<T extends string | number>(
  ids: readonly T[] | null | undefined,
  getLabel: (id: T) => string,
): T[] {
  return sortHierarchyChildIds(ids ?? [], getLabel);
}
