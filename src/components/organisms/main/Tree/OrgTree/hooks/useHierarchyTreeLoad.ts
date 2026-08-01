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

export type UseHierarchyTreeLoadOptions = {
  /**
   * When false, skips hierarchy + GHO/all network requests and does not
   * overwrite the Redux tree. Defaults to true for existing call sites
   * (e.g. organogram page).
   */
  enabled?: boolean;
};

export const useHierarchyTreeLoad = (
  options?: UseHierarchyTreeLoadOptions,
) => {
  const enabled = options?.enabled ?? true;
  const router = useRouter();
  const pathname = router.pathname || '';
  const isHierarquiaPage =
    pathname.includes('/empresas/') && pathname.includes('/hierarquia');
  const tabWorkspaceId = isHierarquiaPage
    ? (router.query.tabWorkspaceId as string | undefined)
    : undefined;
  const {
    data,
    isLoading: isHierarchiesLoading,
    isFetching: isHierarchiesFetching,
    isError: isHierarchiesError,
    isSuccess: isHierarchiesSuccess,
    refetch: refetchHierarchies,
  } = useQueryHierarchies(undefined, { enabled });
  const {
    data: gho,
    isLoading: isGhoLoading,
    isFetching: isGhoFetching,
    isError: isGhoError,
  } = useQueryGHOAll(undefined, undefined, { enabled });
  const { data: company, isLoading: isCompanyLoading } = useQueryCompany();
  const store = useStore<any>();

  const { setTree, transformToTreeMap, searchFilterNodes } =
    useHierarchyTreeActions();

  useEffect(() => {
    if (!enabled) return;

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
    enabled,
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

  const isLoading =
    enabled &&
    (isCompanyLoading || isHierarchiesLoading || isGhoLoading || !company);
  const isFetching = enabled && (isHierarchiesFetching || isGhoFetching);
  const isError = enabled && (isHierarchiesError || isGhoError);
  const hierarchyCount = data ? Object.keys(data).length : 0;
  const isEmpty =
    enabled &&
    !isLoading &&
    !isError &&
    isHierarchiesSuccess &&
    hierarchyCount === 0;

  return {
    hierarchies: data,
    gho,
    company,
    store,
    isLoading,
    isFetching,
    isError,
    isEmpty,
    hierarchyCount,
    refetchHierarchies,
    enabled,
  };
};
