export function splitHierarchyModalId(modalId: string): {
  hierarchyId: string;
  workspaceId: string;
} {
  const [hierarchyId, workspaceId] = String(modalId || '').split('//');
  return {
    hierarchyId: hierarchyId || '',
    workspaceId: workspaceId || '',
  };
}

export function filterModalIdsByWorkspace(
  modalSelectIds: string[],
  workspaceId: string,
): string[] {
  if (!workspaceId) return [];
  return modalSelectIds.filter(
    (id) => splitHierarchyModalId(id).workspaceId === workspaceId,
  );
}

export function keepModalIdsOutsideWorkspace(
  modalSelectIds: string[],
  workspaceId: string,
): string[] {
  if (!workspaceId) return [...modalSelectIds];
  return modalSelectIds.filter(
    (id) => splitHierarchyModalId(id).workspaceId !== workspaceId,
  );
}

export function uniqueModalIds(ids: string[]): string[] {
  const seen = new Set<string>();
  return ids.filter((id) => {
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/** União da seleção do estabelecimento atual com os ids dos demais. */
export function mergeCurrentWorkspaceSelection(
  modalSelectIds: string[],
  workspaceId: string,
  nextWorkspaceIds: string[],
): string[] {
  return uniqueModalIds([
    ...keepModalIdsOutsideWorkspace(modalSelectIds, workspaceId),
    ...filterModalIdsByWorkspace(nextWorkspaceIds, workspaceId),
  ]);
}

export function partitionGseModalColumns(params: {
  currentWorkspaceId: string;
  catalogIdsInCurrentWorkspace: string[];
  modalSelectIds: string[];
}): {
  leftIds: string[];
  rightIds: string[];
  hiddenPreservedIds: string[];
} {
  const selected = new Set(params.modalSelectIds);
  return {
    leftIds: params.catalogIdsInCurrentWorkspace.filter(
      (id) => !selected.has(id),
    ),
    rightIds: filterModalIdsByWorkspace(
      params.modalSelectIds,
      params.currentWorkspaceId,
    ),
    hiddenPreservedIds: keepModalIdsOutsideWorkspace(
      params.modalSelectIds,
      params.currentWorkspaceId,
    ),
  };
}
