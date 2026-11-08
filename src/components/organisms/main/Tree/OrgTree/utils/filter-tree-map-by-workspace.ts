import { firstNodeId } from 'core/constants/first-node-id.constant';

import { ITreeMap } from '../interfaces';
import { getWorkspaceIdFromTreeNode } from './get-org-workspace-id';

/**
 * Prunes visible branches while keeping the full node map for tree operations.
 * No selection or an entirely unknown selection keeps the original tree.
 */
export function filterTreeMapByWorkspace(
  nodes: ITreeMap,
  workspaceIds: string[],
): ITreeMap {
  if (!workspaceIds.length) return nodes;

  const root = nodes[firstNodeId];
  if (!root?.childrenIds?.length) return nodes;

  const selectedIds = new Set(workspaceIds);
  const updates: ITreeMap = {};

  function keepBranch(id: string | number): boolean {
    const node = nodes[id];
    if (!node) return false;

    const workspaceId = getWorkspaceIdFromTreeNode(node);
    if (workspaceId) return selectedIds.has(workspaceId);

    const children = node.childrenIds || [];
    const visibleChildren = children.filter(keepBranch);
    if (visibleChildren.length && visibleChildren.length !== children.length) {
      updates[id] = { ...node, childrenIds: visibleChildren };
    }
    return visibleChildren.length > 0;
  }

  if (!keepBranch(firstNodeId)) return nodes;
  return { ...nodes, ...updates };
}
