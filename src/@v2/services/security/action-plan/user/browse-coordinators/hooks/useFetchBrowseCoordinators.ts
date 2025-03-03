import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseCoordinatorParams } from '../service/browse-coordinators.types';
import { browseCoordinator } from '../service/browse-coordinators.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { QueryKeyAuthEnum } from '@v2/constants/enums/auth-query-key.enum';

export const useFetchBrowseCoordinator = (params: BrowseCoordinatorParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseCoordinator(params);
    },
    queryKey: [
      QueryKeyAuthEnum.USERS,
      params.companyId,
      QueryKeyActionPlanEnum.ACTION_PLAN_COORDINATORS,
      params,
    ],
  });

  return {
    ...response,
    coordinators: data,
  };
};
