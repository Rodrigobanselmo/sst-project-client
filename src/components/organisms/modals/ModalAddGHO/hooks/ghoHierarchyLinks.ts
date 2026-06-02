import { IHierarchy } from 'core/interfaces/api/IHierarchy';

export type GhoHierarchyLink = { id: string; workspaceId: string };

const linkKey = (link: GhoHierarchyLink) => `${link.id}//${link.workspaceId}`;

export function mapModalSelectIdsToGhoLinks(
  modalSelectIds: string[],
  fallbackWorkspaceId?: string,
): GhoHierarchyLink[] {
  return modalSelectIds
    .map((modalId) => {
      const [id, workspaceId] = modalId.split('//');
      return {
        id,
        workspaceId: workspaceId || fallbackWorkspaceId || '',
      };
    })
    .filter((link) => link.id && link.workspaceId);
}

/** Vínculos ativos exibidos na tabela (mesma lógica de `allHierarchiesIds`). */
export function mapGhoHierarchiesToActiveLinks(
  hierarchies: IHierarchy[],
): GhoHierarchyLink[] {
  return hierarchies.flatMap((hierarchy) => {
    const hierarchyId = String(hierarchy.id).split('//')[0];
    const activeBindings = hierarchy.hierarchyOnHomogeneous?.filter(
      (hg) => !hg?.endDate,
    );

    if (activeBindings?.length) {
      return activeBindings.map((hg) => ({
        id: String(hg.hierarchyId || hierarchyId),
        workspaceId: hg.workspaceId,
      }));
    }

    const workspaceId = (hierarchy as { workspaceId?: string }).workspaceId;
    if (workspaceId) {
      return [{ id: hierarchyId, workspaceId }];
    }

    if (hierarchy.workspaces?.length) {
      return hierarchy.workspaces.map((workspace) => ({
        id: hierarchyId,
        workspaceId: workspace.id,
      }));
    }

    if (hierarchy.workspaceIds?.length) {
      return hierarchy.workspaceIds.map((wsId) => ({
        id: hierarchyId,
        workspaceId: wsId,
      }));
    }

    return [];
  });
}

export function mergeGhoHierarchyLinks(
  ...groups: GhoHierarchyLink[][]
): GhoHierarchyLink[] {
  const byKey = new Map<string, GhoHierarchyLink>();
  groups.flat().forEach((link) => byKey.set(linkKey(link), link));
  return [...byKey.values()];
}
