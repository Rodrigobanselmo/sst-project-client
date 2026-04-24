import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from 'react-redux';

import { ITreeMap } from 'components/organisms/main/Tree/OrgTree/interfaces';
import { firstNodeId } from 'core/constants/first-node-id.constant';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';

function filterTreeMapByWorkspace(
  nodes: ITreeMap,
  workspaceId: string,
): ITreeMap {
  const root = nodes[firstNodeId];
  if (!root?.childrenIds?.includes(workspaceId)) return nodes;
  return {
    ...nodes,
    [firstNodeId]: {
      ...root,
      childrenIds: [workspaceId],
    },
  };
}

export const useHierarchyTreeLoad = () => {
  const router = useRouter();
  const pathname = router.pathname || '';
  const isHierarquiaPage =
    pathname.includes('/empresas/') && pathname.includes('/hierarquia');
  const tabWorkspaceId = isHierarquiaPage
    ? (router.query.tabWorkspaceId as string | undefined)
    : undefined;
  const { data } = useQueryHierarchies();
  const { data: gho } = useQueryGHOAll();
  const { data: company } = useQueryCompany();
  const store = useStore<any>();

  const { setTree, transformToTreeMap, searchFilterNodes } =
    useHierarchyTreeActions();

  useEffect(() => {
    const search = store.getState().hierarchy.search as string;

    if (data && company && gho) {
      const fullMap = transformToTreeMap(data, company);
      const nextMap =
        tabWorkspaceId &&
        fullMap[firstNodeId]?.childrenIds?.includes(tabWorkspaceId)
          ? filterTreeMapByWorkspace(fullMap, tabWorkspaceId)
          : fullMap;
      setTree(nextMap);
      if (search) searchFilterNodes(search);
    }
  }, [
    setTree,
    data,
    company,
    gho,
    tabWorkspaceId,
    pathname,
    transformToTreeMap,
    store,
    searchFilterNodes,
  ]);

  return { hierarchies: data, gho, company, store };
};
