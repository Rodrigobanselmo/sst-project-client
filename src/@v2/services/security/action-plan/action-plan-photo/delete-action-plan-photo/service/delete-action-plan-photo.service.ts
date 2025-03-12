import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { DeleteActionPlanPhotoParams } from './delete-action-plan-photo.types';

export async function deleteActionPlanPhoto({
  companyId,
  photoId,
}: DeleteActionPlanPhotoParams) {
  await api.delete(
    bindUrlParams({
      path: ActionPlanRoutes.ACTION_PLAN.PHOTO.DELETE,
      pathParams: { companyId, photoId },
    }),
  );
}
