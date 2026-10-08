type GhoSelectionLink = {
  id?: string;
  workspaceId?: string;
};

/**
 * Ids de árvore (`hierarquia//estabelecimento`) dos vínculos explícitos
 * devolvidos pelo servidor. Não calcula cargos herdados.
 * Se o vínculo traz workspaceId, usa só esse estabelecimento.
 * Se não traz, repete o id em cada estabelecimento do GSE — o mesmo
 * formato com que a lista do organograma marca o rádio ao selecionar o GSE.
 */
export function explicitGhoSelectionTreeIds(gho: {
  hierarchies?: GhoSelectionLink[] | null;
  workspaceIds?: string[] | null;
}): string[] {
  const hierarchies = gho.hierarchies || [];
  const workspaceIds = (gho.workspaceIds || []).filter(Boolean);
  const ids: string[] = [];

  hierarchies.forEach((hierarchy) => {
    if (!hierarchy?.id) return;
    const hierarchyId = String(hierarchy.id).split('//')[0];
    if (hierarchy.workspaceId) {
      ids.push(`${hierarchyId}//${hierarchy.workspaceId}`);
      return;
    }
    if (workspaceIds.length) {
      workspaceIds.forEach((workspaceId) => {
        ids.push(`${hierarchyId}//${workspaceId}`);
      });
      return;
    }
    ids.push(hierarchyId);
  });

  return [...new Set(ids)];
}

export function sameGhoSelectionTreeIds(
  left: string[],
  right: string[],
): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}
