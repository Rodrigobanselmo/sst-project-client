import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface DeleteFormPreliminaryLibraryBlockParams {
  companyId: string;
  blockId: string;
}

export async function deleteFormPreliminaryLibraryBlock({
  companyId,
  blockId,
}: DeleteFormPreliminaryLibraryBlockParams) {
  await api.delete(
    bindUrlParams({
      path: FormRoutes.FORM_PRELIMINARY_LIBRARY.BLOCK_ID,
      pathParams: { companyId, blockId },
    }),
  );
}
