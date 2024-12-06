import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseResponsibleParams } from '../service/browse-responsibles.types';
import { browseResponsible } from '../service/browse-responsibles.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';

export const useFetchBrowseResponsibles = (params: BrowseResponsibleParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseResponsible(params);
    },
    queryKey: [
      QueryKeyActionPlanEnum.ACTION_PLAN_RESPONSIBLES,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    responsibles: data,
  };
};