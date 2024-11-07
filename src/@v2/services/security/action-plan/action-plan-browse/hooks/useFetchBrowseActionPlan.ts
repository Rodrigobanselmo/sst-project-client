import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseActionPlanParams } from '../service/action-plan-characterization.types';
import { browseActionPlan } from '../service/action-plan-characterization.service';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';

export const useFetchBrowseActionPlan = (params: BrowseActionPlanParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseActionPlan(params);
    },
    queryKey: [QueryKeyEnum.ACTION_PLAN, params.companyId, params],
  });

  return {
    ...response,
    data: data,
  };
};
