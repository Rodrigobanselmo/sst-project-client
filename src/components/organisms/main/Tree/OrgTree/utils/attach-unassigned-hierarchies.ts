import type { ITreeMap } from '../interfaces';

type UnassignedHierarchy = {
  id: string;
  name: string;
  type: string;
  workspaceIds?: string[];
  deletedAt?: unknown;
  description?: string;
  realDescription?: string;
  employeesCount?: number;
};

/** Presentation only: never invent an establishment or change the stored parent. */
export function attachUnassignedHierarchies(
  nodes: ITreeMap,
  hierarchies: Record<string, UnassignedHierarchy>,
  companyTreeId: string,
): void {
  const root = nodes[companyTreeId];
  if (!root) return;
  const unassigned = Object.values(hierarchies)
    .filter(h => !h.deletedAt && !h.workspaceIds?.length)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  for (const hierarchy of unassigned) {
    // The real hierarchy ID keeps existing read/delete actions scoped to its record.
    nodes[hierarchy.id] = {
      id: hierarchy.id,
      label: hierarchy.name,
      type: hierarchy.type as ITreeMap[string]['type'],
      parentId: companyTreeId,
      childrenIds: [],
      expand: true,
      stopDrag: true,
      missingWorkspace: true,
      description: hierarchy.description,
      realDescription: hierarchy.realDescription,
      employeesCount: hierarchy.employeesCount ?? 0,
      ghos: [],
    };
    if (!root.childrenIds.includes(hierarchy.id)) root.childrenIds.push(hierarchy.id);
  }
}
