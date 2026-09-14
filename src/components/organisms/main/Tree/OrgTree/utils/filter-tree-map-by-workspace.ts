import { firstNodeId } from 'core/constants/first-node-id.constant';

import { ITreeMap } from '../interfaces';
import { treeNodeCoversWorkspace } from './get-org-workspace-id';

/**
 * Filtro visual da raiz do organograma.
 * 0 ids = empresa inteira; ids existentes = somente esses ramos, na ordem da árvore.
 * Se nenhum id existir na raiz, devolve a árvore intacta (mesmo fallback de 1 id inválido).
 *
 * Não assume que `root.childrenIds` sejam todos workspaces: um filho intermediário
 * é mantido se algum descendente workspace estiver selecionado.
 */
export function filterTreeMapByWorkspace(
  nodes: ITreeMap,
  workspaceIds: string[],
): ITreeMap {
  if (!workspaceIds.length) return nodes;

  const root = nodes[firstNodeId];
  if (!root?.childrenIds?.length) return nodes;

  const nextChildren = root.childrenIds.filter((id) =>
    workspaceIds.some((workspaceId) =>
      treeNodeCoversWorkspace(nodes, id, workspaceId),
    ),
  );
  if (!nextChildren.length) return nodes;

  return {
    ...nodes,
    [firstNodeId]: {
      ...root,
      childrenIds: nextChildren,
    },
  };
}
