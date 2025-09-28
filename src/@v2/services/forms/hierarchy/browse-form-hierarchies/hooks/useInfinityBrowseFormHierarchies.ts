import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useInfiniteFetch } from '@v2/hooks/api/useInfiniteFetch';
import { BrowseFormHierarchiesParams } from '../service/browse-form-hierarchies.types';
import { browseFormHierarchies } from '../service/browse-form-hierarchies.service';

export const useInfinityBrowseFormHierarchies = (
  params: BrowseFormHierarchiesParams,
) => {
  const { data, ...response } = useInfiniteFetch({
    queryFn: async ({ page }) => {
      return browseFormHierarchies({
        ...params,
        pagination: {
          ...params.pagination,
          page: page,
        },
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.nextPage;
    },
    queryKey: [
      QueryKeyFormEnum.FORM_HIERARCHIES,
      params.companyId,
      params,
      QueryKeyEnum.INFINITE,
    ],
  });

  return {
    ...response,
    hierarchies: data,
  };
};
