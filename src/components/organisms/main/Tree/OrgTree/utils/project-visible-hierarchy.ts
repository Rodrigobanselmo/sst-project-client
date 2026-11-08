import { firstNodeId } from 'core/constants/first-node-id.constant';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap, ITreeMapObject } from '../interfaces';

type NodeId = ITreeMapObject['id'];

export type VisibleHierarchy = {
  roots: NodeId[];
  children: Map<NodeId, NodeId[]>;
  renderedIds: Set<NodeId>;
};

export function canHideHierarchyLevel(type: TreeTypeEnum) {
  return type !== TreeTypeEnum.OFFICE && type !== TreeTypeEnum.SUB_OFFICE;
}

/** Compress the rendered branches without changing node identities or parents. */
export function projectVisibleHierarchy(
  nodes: ITreeMap,
  hiddenLevels: ReadonlySet<TreeTypeEnum>,
  collapsable: boolean,
): VisibleHierarchy {
  const children = new Map<NodeId, NodeId[]>();
  const renderedIds = new Set<NodeId>();
  const visited = new Set<string>();

  function visit(id: NodeId, siblings: NodeId[], rendered: boolean) {
    const node = nodes[id];
    if (!node || node.hide || visited.has(String(id))) return;
    visited.add(String(id));

    if (hiddenLevels.has(node.type) && canHideHierarchyLevel(node.type)) {
      for (const child of node.childrenIds) visit(child, siblings, rendered);
      return;
    }

    siblings.push(id);
    if (rendered) renderedIds.add(id);
    const projectedChildren: NodeId[] = [];
    children.set(id, projectedChildren);

    const expanded = !collapsable || node.expand || node.searchExpand;
    for (const child of node.childrenIds) {
      visit(child, projectedChildren, rendered && (!!expanded || child === 'mock_id'));
    }
  }

  const roots: NodeId[] = [];
  visit(firstNodeId, roots, true);
  return { roots, children, renderedIds };
}
