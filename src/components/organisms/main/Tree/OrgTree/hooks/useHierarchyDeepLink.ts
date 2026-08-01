import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useStore } from 'react-redux';

import type { ITreeMap } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';

export type HierarchyDeepLinkStatus =
  | 'idle'
  | 'applied'
  | 'not-found'
  | 'skipped';

/**
 * Deep-link contract for organogram focus from Assistente de GSE:
 *   ?tabWorkspaceId=<workspaceUuid>
 *   &hierarchyId=<hierarchyUuid>
 *   &openCard=1   (optional — opens edit modal after tree is ready)
 *
 * Node keys: `${hierarchyId}//${workspaceId}`.
 *
 * Must NOT subscribe to Redux `hierarchy.nodes` via useSelector on the
 * hierarchy page: that re-renders on every setTree and, with an unstable
 * `searchFilterNodes` in useHierarchyTreeLoad deps, caused an infinite
 * setTree loop (white screen) on both traditional and deep-link access.
 */
export function useHierarchyDeepLink(ready: boolean): {
  status: HierarchyDeepLinkStatus;
  missingNodeMessage: string | null;
} {
  const router = useRouter();
  const store = useStore<{ hierarchy: { nodes: ITreeMap } }>();
  const appliedRef = useRef<string | null>(null);
  const [status, setStatus] = useState<HierarchyDeepLinkStatus>('idle');
  const [missingNodeMessage, setMissingNodeMessage] = useState<string | null>(
    null,
  );
  const { getPathById, editNodes, setSelectedItem } = useHierarchyTreeActions();

  useEffect(() => {
    if (!ready || !router.isReady) return;

    const hierarchyId = router.query.hierarchyId;
    const tabWorkspaceId = router.query.tabWorkspaceId;
    const openCard = router.query.openCard;

    if (typeof hierarchyId !== 'string' || !hierarchyId) {
      setStatus('skipped');
      setMissingNodeMessage(null);
      return;
    }
    if (typeof tabWorkspaceId !== 'string' || !tabWorkspaceId) {
      setStatus('not-found');
      setMissingNodeMessage(
        'Estabelecimento não informado na URL. A árvore permanece disponível.',
      );
      return;
    }

    const treeNodeId = `${hierarchyId}//${tabWorkspaceId}`;
    const applyKey = `${treeNodeId}|${openCard === '1' ? '1' : '0'}`;
    if (appliedRef.current === applyKey) return;

    // Read from store — do not subscribe (avoids render ↔ setTree loop).
    const nodes = store.getState().hierarchy.nodes;
    const node = nodes?.[treeNodeId];
    if (!node) {
      // Tree may still be hydrating into Redux after query success; retry until
      // ready flips or node appears. Do not mark applied yet.
      const hasCompanyRoot = Boolean(nodes && Object.keys(nodes).length > 1);
      if (!hasCompanyRoot) return;

      appliedRef.current = applyKey;
      setStatus('not-found');
      setMissingNodeMessage(
        'O item solicitado não foi encontrado neste estabelecimento. A árvore restante permanece disponível.',
      );
      return;
    }

    appliedRef.current = applyKey;
    setStatus('applied');
    setMissingNodeMessage(null);

    const path = getPathById(treeNodeId);
    const ancestorEdits = path
      .slice(0, -1)
      .filter((id) => nodes[id])
      .map((id) => ({
        id,
        expand: true,
        searchExpand: true,
        hide: false,
      }));

    if (ancestorEdits.length) {
      editNodes(ancestorEdits, true);
    }

    if (openCard === '1') {
      setSelectedItem(node, 'edit');
    }
  }, [
    ready,
    router.isReady,
    router.query.hierarchyId,
    router.query.tabWorkspaceId,
    router.query.openCard,
    store,
    getPathById,
    editNodes,
    setSelectedItem,
  ]);

  return { status, missingNodeMessage };
}
