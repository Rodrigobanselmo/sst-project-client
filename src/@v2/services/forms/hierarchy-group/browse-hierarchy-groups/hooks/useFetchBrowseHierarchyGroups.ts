import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  browseHierarchyGroups,
  BrowseHierarchyGroupsParams,
} from '../service/browse-hierarchy-groups.service';

export const getKeyBrowseHierarchyGroups = (
  params: BrowseHierarchyGroupsParams,
) => {
  return [
    QueryKeyFormEnum.FORM_HIERARCHY_GROUPS,
    params.companyId,
    params.applicationId,
  ];
};

export const useFetchBrowseHierarchyGroups = (
  params: BrowseHierarchyGroupsParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseHierarchyGroups(params);
    },
    queryKey: getKeyBrowseHierarchyGroups(params),
  });

  return {
    ...response,
    hierarchyGroups: data ?? [],
  };
};
