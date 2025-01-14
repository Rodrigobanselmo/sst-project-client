import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { EditManyCharacterizationParams } from './edit-many-characterization.types';
import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';

export async function editManyCharacterization({
  companyId,
  workspaceId,
  ...body
}: EditManyCharacterizationParams) {
  await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.EDIT_MANY,
      pathParams: { companyId, workspaceId },
    }),
    body,
  );
}
