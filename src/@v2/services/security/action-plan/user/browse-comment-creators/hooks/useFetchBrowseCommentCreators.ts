import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseCommentCreatorParams } from '../service/browse-comment-creators.types';
import { browseCommentCreator } from '../service/browse-comment-creators.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { QueryKeyAuthEnum } from '@v2/constants/enums/auth-query-key.enum';

export const useFetchBrowseCommentCreators = (
  params: BrowseCommentCreatorParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseCommentCreator(params);
    },
    queryKey: [
      QueryKeyAuthEnum.USERS,
      params.companyId,
      QueryKeyActionPlanEnum.ACTION_PLAN_COMMENT_CREATORS,
      params,
    ],
  });

  return {
    ...response,
    creators: data,
  };
};
