import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { EditManyActionPlanParams } from './edit-many-action-plan.types';

export async function editManyActionPlan({
  companyId,
  ...body
}: EditManyActionPlanParams) {
  await api.post(
    bindUrlParams({
      path: ActionPlanRoutes.ACTION_PLAN.EDIT_MANY,
      pathParams: { companyId },
    }),
    body,
  );
}
