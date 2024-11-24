import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { readActionPlanInfo } from '../service/read-action-plan-info.service';
import { ReadActionPlanInfoParams } from '../service/read-action-plan-info.types';

export const useFetchReadActionPlanInfo = (
  params: ReadActionPlanInfoParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return readActionPlanInfo(params);
    },
    queryKey: [
      QueryKeyActionPlanEnum.ACTION_PLAN_INFO,
      params.companyId,
      params.workspaceId,
    ],
  });

  return {
    ...response,
    data: data,
  };
};
