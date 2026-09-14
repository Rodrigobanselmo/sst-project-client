import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStore } from 'react-redux';

import { filterTreeMapByWorkspace } from 'components/organisms/main/Tree/OrgTree/utils/filter-tree-map-by-workspace';
import { useHierarchyTreeActions } from 'core/hooks/useHierarchyTreeActions';
import { useQueryCompany } from 'core/services/hooks/queries/useQueryCompany';
import { useQueryGHOAll } from 'core/services/hooks/queries/useQueryGHOAll';
import { useQueryHierarchies } from 'core/services/hooks/queries/useQueryHierarchies';
import { parseOrgWorkspaceFilterIds } from 'core/utils/org-workspace-query';

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
  const orgWorkspaceFilterKey = isHierarquiaPage
    ? parseOrgWorkspaceFilterIds(router.query).join(',')
    : '';
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
      const selectedWorkspaceIds = orgWorkspaceFilterKey
        ? orgWorkspaceFilterKey.split(',')
        : [];
      const nextMap = filterTreeMapByWorkspace(fullMap, selectedWorkspaceIds);
      setTree(nextMap);
      if (search) searchFilterNodes(search);
    }
  }, [
    enabled,
    setTree,
    data,
    company,
    gho,
    orgWorkspaceFilterKey,
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
