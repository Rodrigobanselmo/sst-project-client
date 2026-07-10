/**
 * Hierarchy tree `children` is `string[]` of ids.
 * Some GHO-like payloads may use `{ id }[]`.
 * Never map `string` with `.id` (yields `undefined`).
 */
export function normalizeChildrenIds(
  children: unknown,
): Array<string | number> | undefined {
  if (!Array.isArray(children)) return undefined;
  return children
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return item;
      if (item && typeof item === 'object' && 'id' in item) {
        const id = (item as { id?: unknown }).id;
        if (typeof id === 'string' || typeof id === 'number') return id;
      }
      return undefined;
    })
    .filter((id): id is string | number => id !== undefined && id !== null);
}
