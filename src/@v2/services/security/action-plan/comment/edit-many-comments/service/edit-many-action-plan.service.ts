import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { EditManyCommentsParams } from './edit-many-action-plan.types';

export async function editManyComments({
  companyId,
  ...body
}: EditManyCommentsParams) {
  await api.post(
    bindUrlParams({
      path: ActionPlanRoutes.COMMENT.EDIT_MANY,
      pathParams: { companyId },
    }),
    body,
  );
}
