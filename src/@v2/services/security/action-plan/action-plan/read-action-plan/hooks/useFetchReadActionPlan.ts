import { useFetch } from '@v2/hooks/api/useFetch';
import { ReadActionPlanParams } from '../service/read-action-plan.types';
import { readActionPlan } from '../service/read-action-plan.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';

export const useFetchReadActionPlan = (params: ReadActionPlanParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return readActionPlan(params);
    },
    queryKey: [
      QueryKeyActionPlanEnum.ACTION_PLAN,
      params.companyId,
      QueryKeyEnum.READ,
      params,
    ],
  });

  return {
    ...response,
    actionPlan: data,
  };
};
