import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseResponsibleParams } from '../service/browse-responsibles.types';
import { browseResponsible } from '../service/browse-responsibles.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { QueryKeyAuthEnum } from '@v2/constants/enums/auth-query-key.enum';
import { useInfiniteFetch } from '@v2/hooks/api/useInfiniteFetch';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';

export const useInfinityBrowseResponsibles = (
  params: BrowseResponsibleParams,
) => {
  const { data, ...response } = useInfiniteFetch({
    queryFn: async ({ page }) => {
      return browseResponsible({
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
      QueryKeyAuthEnum.USERS,
      params.companyId,
      QueryKeyActionPlanEnum.ACTION_PLAN_RESPONSIBLE,
      params,
      QueryKeyEnum.INFINITE,
    ],
  });

  return {
    ...response,
    responsible: data,
  };
};
