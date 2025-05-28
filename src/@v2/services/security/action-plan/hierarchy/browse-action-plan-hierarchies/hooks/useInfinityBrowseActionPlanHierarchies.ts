import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseActionPlanHierarchiesParams } from '../service/browse-action-plan-hierarchies.types';
import { browseActionPlanHierarchies } from '../service/browse-action-plan-hierarchies.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useInfiniteFetch } from '@v2/hooks/api/useInfiniteFetch';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';

export const useInfinityBrowseActionPlanHierarchies = (
  params: BrowseActionPlanHierarchiesParams,
) => {
  const { data, ...response } = useInfiniteFetch({
    queryFn: async ({ page }) => {
      return browseActionPlanHierarchies({
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
      QueryKeyActionPlanEnum.ACTION_PLAN_HIERARCHIES,
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
