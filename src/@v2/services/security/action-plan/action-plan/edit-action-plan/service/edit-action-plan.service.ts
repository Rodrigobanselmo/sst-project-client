import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { EditActionPlanParams } from './edit-action-plan.types';

export async function editActionPlan({
  companyId,
  ...body
}: EditActionPlanParams) {
  await api.post(
    bindUrlParams({
      path: ActionPlanRoutes.ACTION_PLAN.EDIT,
      pathParams: { companyId },
    }),
    body,
  );
}
