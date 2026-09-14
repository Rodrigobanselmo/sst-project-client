import { nodeTypesConstant } from '../constants/node-type.constant';
import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap, ITreeMapObject } from '../interfaces';
import { resolveHierarchyNodeTypeLabel } from './resolve-hierarchy-node-type-label';

export type CopyHierarchyDestinationOption = {
  treeId: string;
  label: string;
  type: TreeTypeEnum;
  typeLabel: string;
  workspaceLabel: string;
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

export function getWorkspaceLabelFromTreeNode(
  node: Pick<ITreeMapObject, 'id' | 'type' | 'parentId'>,
  nodes: ITreeMap,
) {
  const workspaceId = getWorkspaceIdFromTreeNode(node);
  const workspaceNode = nodes[workspaceId];
  if (workspaceNode?.type === TreeTypeEnum.WORKSPACE && workspaceNode.label) {
    return workspaceNode.label;
  }
  return workspaceId;
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
  if (String(source.parentId || '') === String(target.id)) return true;

  const sourceParentId = String(source.parentId || '');
  if (!sourceParentId.includes('//')) return false;

  return (
    getHierarchyIdFromTreeId(sourceParentId) ===
    getHierarchyIdFromTreeId(String(target.id))
  );
}

function isSameStructuralHierarchy(
  source: Pick<ITreeMapObject, 'id'>,
  target: Pick<ITreeMapObject, 'id' | 'type'>,
) {
  if (target.type === TreeTypeEnum.WORKSPACE) return false;
  return (
    getHierarchyIdFromTreeId(String(source.id)) ===
    getHierarchyIdFromTreeId(String(target.id))
  );
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
  if (isSameStructuralHierarchy(source, target)) return false;
  if (isCurrentHierarchyParent(source, target)) return false;
  if (collectSubtreeTreeIds(String(source.id), nodes).has(String(target.id))) {
    return false;
  }
  return (nodeTypesConstant[target.type]?.childOptions || []).includes(
    source.type,
  );
}

export function buildCopyHierarchyBranchPayload(params: {
  source: Pick<ITreeMapObject, 'id' | 'type' | 'parentId'>;
  target: Pick<ITreeMapObject, 'id' | 'type' | 'parentId'>;
}) {
  return {
    sourceHierarchyId: getHierarchyIdFromTreeId(String(params.source.id)),
    sourceWorkspaceId: getWorkspaceIdFromTreeNode(params.source),
    targetParentId:
      params.target.type === TreeTypeEnum.WORKSPACE
        ? null
        : getHierarchyIdFromTreeId(String(params.target.id)),
    targetWorkspaceId: getWorkspaceIdFromTreeNode(params.target),
  };
}

export function formatCopyHierarchyDestinationLabel(
  option: Pick<CopyHierarchyDestinationOption, 'label' | 'workspaceLabel'>,
) {
  return `${option.workspaceLabel} - ${option.label}`;
}

export function getCopyHierarchyDestinationOptions(params: {
  source: Pick<ITreeMapObject, 'id' | 'type' | 'parentId'>;
  nodes: ITreeMap;
  selectedWorkspaceIds?: string[];
}): CopyHierarchyDestinationOption[] {
  const blockedIds = collectSubtreeTreeIds(
    String(params.source.id),
    params.nodes,
  );
  const sourceType = params.source.type;
  const selectedWorkspaceIds = (params.selectedWorkspaceIds || []).filter(
    Boolean,
  );
  const allowedWorkspaceIds = selectedWorkspaceIds.length
    ? new Set(selectedWorkspaceIds)
    : null;

  return Object.values(params.nodes)
    .filter((node) => {
      if (!node || String(node.id) === 'mock_id') return false;
      if (node.showRef) return false;
      if (node.type === TreeTypeEnum.COMPANY) return false;
      if (String(node.id) === String(params.source.id)) return false;
      if (blockedIds.has(String(node.id))) return false;
      if (isSameStructuralHierarchy(params.source, node)) return false;
      if (isCurrentHierarchyParent(params.source, node)) return false;
      if (
        allowedWorkspaceIds &&
        !allowedWorkspaceIds.has(getWorkspaceIdFromTreeNode(node))
      ) {
        return false;
      }
      return (nodeTypesConstant[node.type]?.childOptions || []).includes(
        sourceType,
      );
    })
    .map((node) => {
      const targetWorkspaceId = getWorkspaceIdFromTreeNode(node);
      return {
        treeId: String(node.id),
        label: node.label,
        type: node.type,
        typeLabel: resolveHierarchyNodeTypeLabel(node.type) || node.type,
        workspaceLabel: getWorkspaceLabelFromTreeNode(node, params.nodes),
        targetWorkspaceId,
        targetParentId:
          node.type === TreeTypeEnum.WORKSPACE
            ? null
            : getHierarchyIdFromTreeId(String(node.id)),
      };
    })
    .sort((a, b) => {
      const workspaceCompare = a.workspaceLabel.localeCompare(
        b.workspaceLabel,
        'pt-BR',
      );
      if (workspaceCompare !== 0) return workspaceCompare;
      return a.label.localeCompare(b.label, 'pt-BR');
    });
}
