import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { FormPreliminaryLibraryBlockDetailApi } from '../../types/form-preliminary-library-api.types';

export interface ReadFormPreliminaryLibraryBlockParams {
  companyId: string;
  blockId: string;
}

export async function readFormPreliminaryLibraryBlock({
  companyId,
  blockId,
}: ReadFormPreliminaryLibraryBlockParams) {
  const response = await api.get<FormPreliminaryLibraryBlockDetailApi>(
    bindUrlParams({
      path: FormRoutes.FORM_PRELIMINARY_LIBRARY.BLOCK_ID,
      pathParams: { companyId, blockId },
    }),
  );

  return response.data;
}
