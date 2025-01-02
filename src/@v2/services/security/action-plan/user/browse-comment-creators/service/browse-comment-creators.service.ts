import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseCommentCreatorParams } from './browse-comment-creators.types';
import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import {
  CommentCreatorBrowseModel,
  ICommentCreatorBrowseModel,
} from '@v2/models/security/models/comment-creator/comment-creators-browse.model';

export async function browseCommentCreator({
  pagination,
  orderBy,
  companyId,
  filters = {},
}: BrowseCommentCreatorParams) {
  const response = await api.get<ICommentCreatorBrowseModel>(
    bindUrlParams({
      path: ActionPlanRoutes.COMMENT.CREATOR.BROWSE,
      pathParams: { companyId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new CommentCreatorBrowseModel(response.data);
}
