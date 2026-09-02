export const UNGROUPED_WORKSPACE_ID = '__ungrouped__';
export const UNGROUPED_WORKSPACE_NAME = 'Sem estabelecimento';

export function resolveHierarchyWorkspaceGroupId(params: {
  hierarchyWorkspaceIds: string[];
  gseWorkspaceIds: string[];
  preferredWorkspaceId?: string;
}): string {
  const hierarchyIds = [...new Set(params.hierarchyWorkspaceIds.filter(Boolean))];
  const gseIds = [...new Set(params.gseWorkspaceIds.filter(Boolean))];
  const intersection = gseIds.length
    ? hierarchyIds.filter((id) => gseIds.includes(id))
    : hierarchyIds;

  if (
    params.preferredWorkspaceId &&
    intersection.includes(params.preferredWorkspaceId)
  ) {
    return params.preferredWorkspaceId;
  }

  if (intersection[0]) return intersection[0];
  return UNGROUPED_WORKSPACE_ID;
}

export function compareWorkspaceGroupOrder(params: {
  aGroupId: string;
  bGroupId: string;
  aName: string;
  bName: string;
  preferredWorkspaceId?: string;
}): number {
  const { aGroupId, bGroupId, aName, bName, preferredWorkspaceId } = params;

  if (aGroupId === bGroupId) return 0;

  if (preferredWorkspaceId) {
    if (aGroupId === preferredWorkspaceId) return -1;
    if (bGroupId === preferredWorkspaceId) return 1;
  }

  if (aGroupId === UNGROUPED_WORKSPACE_ID) return 1;
  if (bGroupId === UNGROUPED_WORKSPACE_ID) return -1;

  return aName.localeCompare(bName, 'pt-BR', { sensitivity: 'base' });
}
