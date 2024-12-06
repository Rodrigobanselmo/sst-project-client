import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseCommentsParams } from './browse-action-plan.types';
import {
  CommentBrowseModel,
  ICommentBrowseModel,
} from '@v2/models/security/models/comment/comment-browse.model';

export async function browseComment({
  pagination,
  orderBy,
  companyId,
  filters = {},
}: BrowseCommentsParams) {
  const response = await api.get<ICommentBrowseModel>(
    bindUrlParams({
      path: ActionPlanRoutes.COMMENT.BROWSE,
      pathParams: { companyId },
      queryParams: {
        orderBy: orderBy?.filter(({ order }) => order != 'none'),
        ...pagination,
        ...filters,
      },
    }),
  );

  return new CommentBrowseModel(response.data);
}
