import { QueryKeyCompanyEnum } from '@v2/constants/enums/company-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { listHierarchyTypes } from '../service/list-hierarchy-types.service';
import { ListHierarchyTypesParams } from '../service/list-hierarchy-types.types';
import { QueryKeyHierarchyEnum } from '@v2/constants/enums/hierarchy-query-key.enum';

export const useFetchListHierarchyTypes = (
  params: ListHierarchyTypesParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return listHierarchyTypes(params);
    },
    queryKey: [QueryKeyHierarchyEnum.HIERARCHY_TYPES, params.companyId, params],
  });

  return {
    ...response,
    isLoadingTypes: response.isLoading,
    types: data?.types || [],
  };
};
