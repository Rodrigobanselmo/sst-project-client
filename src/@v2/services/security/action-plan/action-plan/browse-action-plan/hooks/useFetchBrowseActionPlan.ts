import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseActionPlanParams } from '../service/browse-action-plan.types';
import { browseActionPlan } from '../service/browse-action-plan.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';

export const useFetchBrowseActionPlan = (params: BrowseActionPlanParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseActionPlan(params);
    },
    queryKey: [QueryKeyActionPlanEnum.ACTION_PLAN, params.companyId, params],
  });

  return {
    ...response,
    data: data,
  };
};
