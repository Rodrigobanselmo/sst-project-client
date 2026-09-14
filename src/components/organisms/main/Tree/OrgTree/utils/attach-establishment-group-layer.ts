import { firstNodeId } from 'core/constants/first-node-id.constant';
import { IEstablishmentGroup, IWorkspace } from 'core/interfaces/api/ICompany';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap, ITreeMapObject } from '../interfaces';

export const ESTABLISHMENT_GROUP_TREE_PREFIX = 'establishment-group:';
export const UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID =
  'establishment-group:ungrouped';

export function toEstablishmentGroupTreeId(groupId: string) {
  return `${ESTABLISHMENT_GROUP_TREE_PREFIX}${groupId}`;
}

export function isEstablishmentGroupTreeId(
  id: string | number | null | undefined,
) {
  return String(id || '').startsWith(ESTABLISHMENT_GROUP_TREE_PREFIX);
}

export function isUngroupedEstablishmentGroupTreeId(
  id: string | number | null | undefined,
) {
  return String(id || '') === UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID;
}

export function getEstablishmentGroupIdFromTreeId(
  id: string | number | null | undefined,
) {
  if (!isEstablishmentGroupTreeId(id) || isUngroupedEstablishmentGroupTreeId(id)) {
    return '';
  }
  return String(id).slice(ESTABLISHMENT_GROUP_TREE_PREFIX.length);
}

export function isEstablishmentGroupTreeType(type?: TreeTypeEnum) {
  return type === TreeTypeEnum.ESTABLISHMENT_GROUP;
}

export function isVirtualOrgContainerNode(
  node?: Pick<ITreeMapObject, 'id' | 'type'> | null,
) {
  if (!node) return false;
  return (
    isEstablishmentGroupTreeType(node.type) ||
    isEstablishmentGroupTreeId(node.id)
  );
}

function groupNode(partial: {
  id: string;
  label: string;
  childrenIds: Array<string | number>;
}): ITreeMapObject {
  return {
    id: partial.id,
    label: partial.label,
    parentId: firstNodeId,
    childrenIds: partial.childrenIds,
    type: TreeTypeEnum.ESTABLISHMENT_GROUP,
    expand: true,
    stopDrag: true,
    ghos: [],
  };
}

/**
 * Reparenta Workspaces sob grupos visuais quando a empresa tem pelo menos
 * um EstablishmentGroup. Sem grupos, devolve o treeMap intacto.
 * Grupos vazios não entram no organograma.
 */
export function attachEstablishmentGroupLayer(
  treeMap: ITreeMap,
  params: {
    groups?: Array<
      Pick<IEstablishmentGroup, 'id' | 'name' | 'sortOrder' | 'status'>
    >;
    workspaces?: Array<Pick<IWorkspace, 'id' | 'establishmentGroupId'>>;
  },
): ITreeMap {
  const groups = [...(params.groups || [])].sort((a, b) => {
    const order = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (order !== 0) return order;
    return String(a.name || '').localeCompare(String(b.name || ''), 'pt-BR');
  });

  if (!groups.length) return treeMap;

  const root = treeMap[firstNodeId];
  if (!root) return treeMap;

  const workspaceIds = (root.childrenIds || []).filter(
    (id) => treeMap[id]?.type === TreeTypeEnum.WORKSPACE,
  );
  const groupIdByWorkspace = new Map(
    (params.workspaces || []).map((workspace) => [
      workspace.id,
      workspace.establishmentGroupId || '',
    ]),
  );

  const groupedChildren: Array<string | number> = [];
  const assignedWorkspaceIds = new Set<string>();

  groups.forEach((group) => {
    const children = workspaceIds.filter(
      (id) => groupIdByWorkspace.get(String(id)) === group.id,
    );
    if (!children.length) return;

    const treeId = toEstablishmentGroupTreeId(group.id);
    treeMap[treeId] = groupNode({
      id: treeId,
      label: group.name,
      childrenIds: children,
    });
    children.forEach((workspaceId) => {
      assignedWorkspaceIds.add(String(workspaceId));
      if (treeMap[workspaceId]) {
        treeMap[workspaceId].parentId = treeId;
      }
    });
    groupedChildren.push(treeId);
  });

  const ungrouped = workspaceIds.filter(
    (id) => !assignedWorkspaceIds.has(String(id)),
  );

  if (ungrouped.length) {
    treeMap[UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID] = groupNode({
      id: UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID,
      label: 'Sem grupo',
      childrenIds: ungrouped,
    });
    ungrouped.forEach((workspaceId) => {
      if (treeMap[workspaceId]) {
        treeMap[workspaceId].parentId =
          UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID;
      }
    });
    groupedChildren.push(UNGROUPED_ESTABLISHMENT_GROUP_TREE_ID);
  }

  treeMap[firstNodeId] = {
    ...root,
    childrenIds: groupedChildren,
  };

  return treeMap;
}
