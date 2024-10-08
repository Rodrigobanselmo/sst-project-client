import { NodeModel } from '../types';

/** Get all parental nodes of the given node id. */
export function getParents<T = unknown>(
  treeData: NodeModel<T>[],
  id: NodeModel['id'],
) {
  const parents: NodeModel<T>[] = [];
  let node = treeData.find((el) => el.id === id);
  while (node) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    node = treeData.find((el) => el.id === node!.parent);
    if (node) parents.push(node);
  }
  return parents;
}
