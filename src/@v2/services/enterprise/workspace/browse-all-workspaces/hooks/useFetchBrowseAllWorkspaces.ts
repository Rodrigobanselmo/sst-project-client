import { QueryKeyWorkspaceEnum } from '@v2/constants/enums/company-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseAllWorkspaces } from '../service/browse-all-workspaces.service';
import { BrowseAllWorkspacesParams } from '../service/browse-all-workspaces.types';

export const useFetchBrowseAllWorkspaces = (
  params: BrowseAllWorkspacesParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseAllWorkspaces(params);
    },
    queryKey: [
      QueryKeyWorkspaceEnum.WORKSPACE,
      params.companyId,
      QueryKeyWorkspaceEnum.WORKSPACE_ALL,
      params,
    ],
  });

  return {
    ...response,
    isLoadingAllWorkspaces: response.isLoading,
    workspaces: data,
  };
};
