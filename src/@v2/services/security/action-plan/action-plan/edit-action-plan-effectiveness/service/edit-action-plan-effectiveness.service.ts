import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { EditActionPlanEffectivenessParams } from './edit-action-plan-effectiveness.types';

export async function editActionPlanEffectiveness({
  companyId,
  ...body
}: EditActionPlanEffectivenessParams) {
  await api.post(
    bindUrlParams({
      path: ActionPlanRoutes.ACTION_PLAN.EDIT_EFFECTIVENESS,
      pathParams: { companyId },
    }),
    body,
  );
}
