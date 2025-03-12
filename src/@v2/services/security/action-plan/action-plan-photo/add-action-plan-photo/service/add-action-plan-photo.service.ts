import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { AddActionPlanPhotoParams } from './add-action-plan-photo.types';

export async function addActionPlanPhoto({
  companyId,
  ...body
}: AddActionPlanPhotoParams) {
  await api.post(
    bindUrlParams({
      path: ActionPlanRoutes.ACTION_PLAN.PHOTO.ADD,
      pathParams: { companyId },
    }),
    body,
  );
}
