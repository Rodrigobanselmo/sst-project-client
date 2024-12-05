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
    queryFn: async () => {
      return browseActionPlanHierarchies(params);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.nextPage;
    },
    queryKey: [
      QueryKeyEnum.INFINITI,
      QueryKeyActionPlanEnum.ACTION_PLAN_HIERARCHIES,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    hierarchies: data,
  };
};
