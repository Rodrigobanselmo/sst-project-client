/**
 * Safe membership check for establishment-scoped lists.
 * - No workspaceId → do not filter (company-wide).
 * - Missing/non-array workspaceIds → keep item (fail-open; incomplete metadata).
 * - Empty workspaceIds → exclude when filtering (linked to no establishment).
 * - Otherwise → include only if workspaceId is in the list.
 */
export function matchesWorkspaceFilter(
  workspaceId: string | undefined,
  workspaceIds: string[] | null | undefined,
): boolean {
  if (!workspaceId) return true;
  if (!Array.isArray(workspaceIds)) return true;
  if (workspaceIds.length === 0) return false;
  return workspaceIds.includes(workspaceId);
}
