import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { EditManyPhotoRecommendationParams } from './edit-many-photo-recommendation.types';

export async function editManyPhotoRecommendation({
  companyId,
  ...body
}: EditManyPhotoRecommendationParams) {
  await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.PHOTO_RECOMMENDATION.EDIT_MANY,
      pathParams: { companyId },
    }),
    body,
  );
}
