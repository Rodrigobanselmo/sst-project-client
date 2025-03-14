import { ActionPlanRoutes } from '@v2/constants/routes/action-plan.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { AddActionPlanPhotoParams } from './add-action-plan-photo.types';

export async function addActionPlanPhoto({
  companyId,
  ...body
}: AddActionPlanPhotoParams) {
  const formData = new FormData();

  formData.append('file', body.file);
  formData.append('workspaceId', body.workspaceId);
  formData.append('recommendationId', body.recommendationId);
  formData.append('riskDataId', body.riskDataId);

  await api.post(
    bindUrlParams({
      path: ActionPlanRoutes.ACTION_PLAN.PHOTO.ADD,
      pathParams: { companyId },
    }),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
}
