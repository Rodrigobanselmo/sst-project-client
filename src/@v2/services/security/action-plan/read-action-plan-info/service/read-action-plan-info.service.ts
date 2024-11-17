import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { ReadActionPlanInfoParams } from './read-action-plan-info.types';
import {
  ActionPlanInfoModel,
  IActionPlanInfoModel,
} from '@v2/models/security/models/action-plan-info/action-plan-info.model';

export async function readActionPlanInfo({
  companyId,
  workspaceId,
}: ReadActionPlanInfoParams) {
  const response = await api.get<IActionPlanInfoModel>(
    bindUrlParams({
      path: ActionPlanRoutes.ACTION_PLAN_INFO.GET,
      pathParams: { companyId, workspaceId },
    }),
  );

  return new ActionPlanInfoModel(response.data);
}
