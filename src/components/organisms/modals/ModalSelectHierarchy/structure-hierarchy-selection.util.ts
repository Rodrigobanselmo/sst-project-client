import { HierarchyEnum } from 'core/enums/hierarchy.enum';

export const STRUCTURE_FILTER = 'STRUCTURE' as const;

export const STRUCTURE_COVERAGE_TOOLTIP =
  'A seleção de uma estrutura abrange automaticamente todos os cargos subordinados, inclusive os cadastrados depois.';

export type StructureNode = {
  id: string;
  parentId?: string | null;
  type?: string | null;
  workspaceIds?: string[] | null;
};

export function isOrganizationalStructure(type?: string | null): boolean {
  return (
    !!type &&
    type !== HierarchyEnum.OFFICE &&
    type !== HierarchyEnum.SUB_OFFICE
  );
}

function bareId(id?: string | null): string {
  return String(id || '').split('//')[0];
}

export function indexStructureNodes(nodes: StructureNode[]): {
  byId: Map<string, StructureNode>;
  childrenById: Map<string, string[]>;
} {
  const byId = new Map<string, StructureNode>();
  const childrenById = new Map<string, string[]>();

  nodes.forEach((node) => {
    const id = bareId(node.id);
    if (!id) return;
    byId.set(id, node);
    const parentId = bareId(node.parentId);
    if (!parentId) return;
    const children = childrenById.get(parentId) || [];
    children.push(id);
    childrenById.set(parentId, children);
  });

  return { byId, childrenById };
}

export function structureAppliesToWorkspace(
  nodeId: string,
  byId: Map<string, StructureNode>,
  childrenById: Map<string, string[]>,
  workspaceId: string,
): boolean {
  const node = byId.get(bareId(nodeId));
  if (!node || !workspaceId) return false;
  if ((node.workspaceIds || []).includes(workspaceId)) return true;

  const stack = [...(childrenById.get(bareId(nodeId)) || [])];
  const seen = new Set<string>();

  while (stack.length) {
    const currentId = stack.pop() as string;
    if (seen.has(currentId)) continue;
    seen.add(currentId);
    const current = byId.get(currentId);
    if (!current) continue;
    if (
      current.type === HierarchyEnum.OFFICE &&
      (current.workspaceIds || []).includes(workspaceId)
    ) {
      return true;
    }
    stack.push(...(childrenById.get(currentId) || []));
  }

  return false;
}

export function structureBlockedByAncestor(
  nodeId: string,
  explicitIds: Set<string>,
  byId: Map<string, StructureNode>,
): boolean {
  let parentId = bareId(byId.get(bareId(nodeId))?.parentId);
  const seen = new Set<string>();

  while (parentId && !seen.has(parentId)) {
    seen.add(parentId);
    if (explicitIds.has(parentId)) return true;
    parentId = bareId(byId.get(parentId)?.parentId);
  }

  return false;
}

/**
 * Mantém o vínculo mais alto. Descendentes de uma estrutura explícita
 * saem do payload, exceto SUB_OFFICE, que continua no fluxo de funcionários.
 */
export function pruneRedundantHierarchyModalIds(
  modalIds: string[],
  nodes: StructureNode[],
): string[] {
  const { byId } = indexStructureNodes(nodes);
  const explicitByWorkspace = new Map<string, Set<string>>();

  modalIds.forEach((modalId) => {
    const workspaceId = modalId.split('//')[1] || '';
    const explicit = explicitByWorkspace.get(workspaceId) || new Set<string>();
    explicit.add(bareId(modalId));
    explicitByWorkspace.set(workspaceId, explicit);
  });

  return modalIds.filter((modalId) => {
    const id = bareId(modalId);
    const workspaceId = modalId.split('//')[1] || '';
    const explicit = explicitByWorkspace.get(workspaceId);
    if (!id || !explicit?.has(id)) return false;
    if (byId.get(id)?.type === HierarchyEnum.SUB_OFFICE) return true;

    let parentId = bareId(byId.get(id)?.parentId);
    const seen = new Set<string>();
    while (parentId && !seen.has(parentId)) {
      seen.add(parentId);
      if (explicit.has(parentId)) return false;
      parentId = bareId(byId.get(parentId)?.parentId);
    }

    return true;
  });
}
