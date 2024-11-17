import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseCoordinatorParams } from '../service/browse-coordinators.types';
import { browseCoordinator } from '../service/browse-coordinators.service';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';

export const useFetchBrowseCoordinator = (params: BrowseCoordinatorParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseCoordinator(params);
    },
    queryKey: [QueryKeyEnum.ACTION_PLAN_COORDINATORS, params.companyId, params],
  });

  return {
    ...response,
    coordinators: data,
  };
};
