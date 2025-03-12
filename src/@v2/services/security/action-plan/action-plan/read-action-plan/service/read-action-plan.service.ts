import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import {
  ActionPlanReadModel,
  IActionPlanReadModel,
} from '@v2/models/security/models/action-plan/action-plan-read.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { ReadActionPlanParams } from './read-action-plan.types';

export async function readActionPlan({
  companyId,
  recommendationId,
  riskDataId,
  workspaceId,
}: ReadActionPlanParams) {
  const response = await api.get<IActionPlanReadModel>(
    bindUrlParams({
      path: ActionPlanRoutes.ACTION_PLAN.READ,
      pathParams: {
        companyId,
        recommendationId,
        riskDataId,
        workspaceId,
      },
    }),
  );

  return new ActionPlanReadModel(response.data);
}
