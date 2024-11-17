import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { EditActionPlanInfoParams } from './edit-action-plan-info.types';

export async function editActionPlanInfo({
  companyId,
  workspaceId,
  ...body
}: EditActionPlanInfoParams) {
  await api.post(
    bindUrlParams({
      path: ActionPlanRoutes.ACTION_PLAN_INFO.GET,
      pathParams: { companyId, workspaceId },
    }),
    body,
  );
}
