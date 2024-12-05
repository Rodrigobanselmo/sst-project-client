import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseActionPlanHierarchiesParams } from '../service/browse-action-plan-hierarchies.types';
import { browseActionPlanHierarchies } from '../service/browse-action-plan-hierarchies.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';

export const useFetchBrowseActionPlanHierarchies = (
  params: BrowseActionPlanHierarchiesParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseActionPlanHierarchies(params);
    },
    queryKey: [
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
