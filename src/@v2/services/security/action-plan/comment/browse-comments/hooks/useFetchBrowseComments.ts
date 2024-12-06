import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseComment } from '../service/browse-action-plan.service';
import { BrowseCommentsParams } from '../service/browse-action-plan.types';

export const useFetchBrowseComments = (params: BrowseCommentsParams) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseComment(params);
    },
    queryKey: [
      QueryKeyActionPlanEnum.ACTION_PLAN_COMMENT,
      params.companyId,
      params,
    ],
  });

  return {
    ...response,
    data: data,
  };
};
