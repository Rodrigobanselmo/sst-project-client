import { firstNodeId } from 'core/constants/first-node-id.constant';

import { TreeTypeEnum } from '../enums/tree-type.enums';
import { ITreeMap, ITreeMapEdit, ITreeMapObject } from '../interfaces';
import { isEstablishmentGroupTreeId } from './attach-establishment-group-layer';

export type OrgWorkspaceNode = Pick<ITreeMapObject, 'id' | 'type' | 'parentId'>;

/**
 * Workspace embutido na identidade visual `hierarchyId//workspaceId`.
 * Fonte de verdade para nós Hierarchy; ignora a posição no path.
 */
export function getEmbeddedWorkspaceIdFromTreeId(
  treeId: string | number | null | undefined,
): string {
  const parts = String(treeId ?? '').split('//');
  return parts[1] || '';
}

/**
 * Resolve o workspace de um nó estrutural.
 * - Hierarchy `id//workspaceId` → workspace embutido
 * - Workspace sintético → o próprio id
 * - Company → string vazia (não tem workspace)
 *
 * Não usa path[1] nem assume que o pai é workspace.
 */
export function getWorkspaceIdFromTreeNode(node: OrgWorkspaceNode): string {
  const embedded = getEmbeddedWorkspaceIdFromTreeId(node.id);
  if (embedded) return embedded;

  if (node.type === TreeTypeEnum.WORKSPACE) return String(node.id);
  if (node.type === TreeTypeEnum.COMPANY) return '';
  if (node.type === TreeTypeEnum.ESTABLISHMENT_GROUP) return '';
  if (String(node.id) === firstNodeId) return '';
  if (isEstablishmentGroupTreeId(node.id)) return '';

  return '';
}

/**
 * Fallback tipado quando o nó vivo pode não estar no mapa.
 * Uuid sem `//` (exceto Company/seed) continua sendo Workspace no treeMap atual.
 */
export function resolveOrgWorkspaceNodeFromId(
  id: string | number,
  liveNodes?: ITreeMap,
): OrgWorkspaceNode {
  const live = liveNodes?.[id];
  if (live) {
    return { id: live.id, type: live.type, parentId: live.parentId };
  }

  const sid = String(id);
  if (getEmbeddedWorkspaceIdFromTreeId(sid)) {
    return { id: sid, type: TreeTypeEnum.OFFICE, parentId: null };
  }
  if (sid === firstNodeId) {
    return { id: sid, type: TreeTypeEnum.COMPANY, parentId: null };
  }
  if (isEstablishmentGroupTreeId(sid)) {
    return {
      id: sid,
      type: TreeTypeEnum.ESTABLISHMENT_GROUP,
      parentId: firstNodeId,
    };
  }

  return { id: sid, type: TreeTypeEnum.WORKSPACE, parentId: firstNodeId };
}

export function resolveWorkspaceIdForTreeEdit(
  node: Pick<ITreeMapEdit, 'id' | 'type' | 'parentId'>,
  liveNodes: ITreeMap,
): string {
  const live = liveNodes[node.id];
  return getWorkspaceIdFromTreeNode({
    id: node.id,
    type: node.type ?? live?.type ?? TreeTypeEnum.COMPANY,
    parentId:
      node.parentId !== undefined ? node.parentId : live?.parentId ?? null,
  });
}

export function resolveHierarchyUpsertParentId(params: {
  treeParentId: string | number | null | undefined;
  workspaceId: string;
}): string | null {
  const [parentId] = String(params.treeParentId || '').split('//');
  if (
    !parentId ||
    parentId === firstNodeId ||
    parentId === params.workspaceId ||
    isEstablishmentGroupTreeId(parentId)
  ) {
    return null;
  }
  return parentId;
}

export function isCrossWorkspaceHierarchyMove(
  sourceParent: OrgWorkspaceNode,
  target: OrgWorkspaceNode,
): boolean {
  return (
    getWorkspaceIdFromTreeNode(sourceParent) !==
    getWorkspaceIdFromTreeNode(target)
  );
}

/**
 * O nó (ou algum descendente) cobre o workspace selecionado.
 * Workspaces atuais batem pelo próprio id; um pai intermediário futuro
 * seria mantido se um descendente workspace estiver selecionado.
 */
export function treeNodeCoversWorkspace(
  nodes: ITreeMap,
  nodeId: string | number,
  workspaceId: string,
): boolean {
  if (!workspaceId) return false;

  const seen = new Set<string>();
  const visit = (id: string | number): boolean => {
    const key = String(id);
    if (seen.has(key)) return false;
    seen.add(key);

    const node = nodes[id];
    if (!node) return false;
    if (getWorkspaceIdFromTreeNode(node) === workspaceId) return true;

    return (node.childrenIds || []).some(visit);
  };

  return visit(nodeId);
}
