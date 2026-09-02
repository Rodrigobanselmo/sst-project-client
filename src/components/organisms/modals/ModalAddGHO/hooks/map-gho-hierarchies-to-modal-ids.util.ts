import { IHierarchy } from 'core/interfaces/api/IHierarchy';

function isActiveGhoHierarchy(hierarchy: IHierarchy): boolean {
  return !!hierarchy.hierarchyOnHomogeneous?.some((link) => !link?.endDate);
}

function workspaceIdsOf(hierarchy: IHierarchy): string[] {
  if (hierarchy.workspaces?.length) {
    return hierarchy.workspaces.map((workspace) => workspace.id).filter(Boolean);
  }

  return (hierarchy.workspaceIds || []).filter(Boolean);
}

/** Ids `hierarchyId//workspaceId` usados pelo modal de seleção de cargos do GSE. */
export function mapGhoHierarchiesToModalSelectIds(
  hierarchies: IHierarchy[],
  allowedWorkspaceIds?: string[],
): string[] {
  const allowed = new Set((allowedWorkspaceIds || []).filter(Boolean));
  const ids: string[] = [];
  const seen = new Set<string>();

  hierarchies.filter(isActiveGhoHierarchy).forEach((hierarchy) => {
    const hierarchyId = String(hierarchy.id).split('//')[0];
    workspaceIdsOf(hierarchy)
      .filter((workspaceId) => !allowed.size || allowed.has(workspaceId))
      .forEach((workspaceId) => {
        const modalId = `${hierarchyId}//${workspaceId}`;
        if (seen.has(modalId)) return;
        seen.add(modalId);
        ids.push(modalId);
      });
  });

  return ids;
}

export function buildGseCargoModalTitle(gseName?: string): string {
  const name = (gseName || '').trim();
  return name ? `Editar cargos — ${name}` : 'Editar cargos';
}
