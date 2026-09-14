import { nodeTypesConstant } from '../constants/node-type.constant';
import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap, ITreeMapObject } from '../interfaces';
import { resolveHierarchyNodeTypeLabel } from './resolve-hierarchy-node-type-label';

export type CopyHierarchyDestinationOption = {
  treeId: string;
  label: string;
  type: TreeTypeEnum;
  typeLabel: string;
  targetParentId: string | null;
  targetWorkspaceId: string;
};

export function getHierarchyIdFromTreeId(treeId: string) {
  return String(treeId).split('//')[0];
}

export function getWorkspaceIdFromTreeNode(
  node: Pick<ITreeMapObject, 'id' | 'type' | 'parentId'>,
) {
  const parts = String(node.id).split('//');
  if (parts[1]) return parts[1];
  if (node.type === TreeTypeEnum.WORKSPACE) return String(node.id);
  return String(node.parentId || '');
}

export function canCopyHierarchyNode(
  node: Pick<ITreeMapObject, 'id' | 'type' | 'showRef'>,
) {
  if (node.showRef) return false;
  if (
    node.type === TreeTypeEnum.COMPANY ||
    node.type === TreeTypeEnum.WORKSPACE
  ) {
    return false;
  }
  return String(node.id).includes('//');
}

export function collectSubtreeTreeIds(rootId: string, nodes: ITreeMap) {
  const ids = new Set<string>([String(rootId)]);
  const visit = (id: string) => {
    const node = nodes[id];
    if (!node) return;
    (node.childrenIds || []).forEach((childId) => {
      const key = String(childId);
      if (ids.has(key)) return;
      ids.add(key);
      visit(key);
    });
  };
  visit(String(rootId));
  return ids;
}

function isSameWorkspaceNode(node: ITreeMapObject, workspaceId: string) {
  if (node.type === TreeTypeEnum.WORKSPACE) return String(node.id) === workspaceId;
  return String(node.id).split('//')[1] === workspaceId;
}

export function isSameHierarchyWorkspace(
  source: Pick<ITreeMapObject, 'id' | 'type' | 'parentId'>,
  target: Pick<ITreeMapObject, 'id' | 'type' | 'parentId'>,
) {
  return (
    getWorkspaceIdFromTreeNode(source) === getWorkspaceIdFromTreeNode(target)
  );
}

export function isCurrentHierarchyParent(
  source: Pick<ITreeMapObject, 'id' | 'parentId'>,
  target: Pick<ITreeMapObject, 'id'>,
) {
  return String(source.parentId || '') === String(target.id);
}

export function isHierarchyCopyDropAllowed(params: {
  source: ITreeMapObject;
  target: ITreeMapObject;
  nodes: ITreeMap;
}) {
  const { source, target, nodes } = params;
  if (!source || !target) return false;
  if (!canCopyHierarchyNode(source)) return false;
  if (String(source.id) === String(target.id)) return false;
  if (isCurrentHierarchyParent(source, target)) return false;
  if (!isSameHierarchyWorkspace(source, target)) return false;
  if (collectSubtreeTreeIds(String(source.id), nodes).has(String(target.id))) {
    return false;
  }
  return (nodeTypesConstant[target.type]?.childOptions || []).includes(
    source.type,
  );
}

export function getCopyHierarchyDestinationOptions(params: {
  source: Pick<ITreeMapObject, 'id' | 'type' | 'parentId'>;
  nodes: ITreeMap;
}): CopyHierarchyDestinationOption[] {
  const workspaceId = getWorkspaceIdFromTreeNode(params.source);
  const blockedIds = collectSubtreeTreeIds(String(params.source.id), params.nodes);
  const sourceType = params.source.type;

  return Object.values(params.nodes)
    .filter((node) => {
      if (!node || String(node.id) === 'mock_id') return false;
      if (blockedIds.has(String(node.id))) return false;
      if (isCurrentHierarchyParent(params.source, node)) return false;
      if (!isSameWorkspaceNode(node, workspaceId)) return false;
      return (nodeTypesConstant[node.type]?.childOptions || []).includes(
        sourceType,
      );
    })
    .map((node) => ({
      treeId: String(node.id),
      label: node.label,
      type: node.type,
      typeLabel: resolveHierarchyNodeTypeLabel(node.type) || node.type,
      targetWorkspaceId: workspaceId,
      targetParentId:
        node.type === TreeTypeEnum.WORKSPACE
          ? null
          : getHierarchyIdFromTreeId(String(node.id)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}
