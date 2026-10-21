import { api } from 'core/services/apiClient';

export const DESCRIPTION_HIERARCHY_TYPES = [
  'DIRECTORY',
  'MANAGEMENT',
  'SECTOR',
  'SUB_SECTOR',
  'OFFICE',
  'SUB_OFFICE',
] as const;
export type DescriptionHierarchyType =
  (typeof DESCRIPTION_HIERARCHY_TYPES)[number];
export type DescriptionSuggestionInput = {
  type: DescriptionHierarchyType;
  name: string;
  additionalGuidance?: string;
  hierarchyId?: string;
  parentId?: string;
  workspaceId?: string;
};
export async function suggestHierarchyDescription(
  companyId: string,
  input: DescriptionSuggestionInput,
): Promise<{ description: string }> {
  const { data } = await api.post(
    `/v2/companies/${encodeURIComponent(companyId)}/hierarchy/description-suggestion`,
    input,
  );
  return data;
}

// Tree IDs carry the workspace after //; none of the context prose comes from the browser.
export function descriptionSuggestionInput(
  node: {
    id: string | number;
    parentId: string | number | null;
    type: string;
    label: string;
    action: string;
  },
  workspaceIds: string[] = [],
): DescriptionSuggestionInput | undefined {
  if (
    !DESCRIPTION_HIERARCHY_TYPES.includes(
      node.type as DescriptionHierarchyType,
    ) ||
    !node.label.trim()
  )
    return;
  const uuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const [id, treeWorkspace] = String(node.id).split('//');
  const workspaceId =
    treeWorkspace || (workspaceIds.length === 1 ? workspaceIds[0] : undefined);
  if (workspaceId && !uuid.test(workspaceId)) return;
  if (node.action !== 'add')
    return uuid.test(id)
      ? {
          hierarchyId: id,
          workspaceId,
          type: node.type as DescriptionHierarchyType,
          name: node.label.trim(),
        }
      : undefined;
  const [parent, parentWorkspace] = String(node.parentId || '').split('//');
  // An unsaved parent cannot supply trustworthy context. A workspace parent is a root hierarchy.
  if (!workspaceId || !uuid.test(parent)) return;
  const parentId =
    parentWorkspace || parent !== workspaceId ? parent : undefined;
  return {
    type: node.type as DescriptionHierarchyType,
    name: node.label.trim(),
    workspaceId,
    ...(parentId ? { parentId } : {}),
  };
}
