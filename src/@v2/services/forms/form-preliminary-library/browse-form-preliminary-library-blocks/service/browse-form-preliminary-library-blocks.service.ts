import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { BrowseFormPreliminaryLibraryBlocksResponse } from '../../types/form-preliminary-library-api.types';
import { BrowseFormPreliminaryLibraryBlocksParams } from './browse-form-preliminary-library-blocks.types';

export async function browseFormPreliminaryLibraryBlocks({
  companyId,
  search,
  page,
  limit,
}: BrowseFormPreliminaryLibraryBlocksParams) {
  const response = await api.get<BrowseFormPreliminaryLibraryBlocksResponse>(
    bindUrlParams({
      path: FormRoutes.FORM_PRELIMINARY_LIBRARY.BLOCKS,
      pathParams: { companyId },
      queryParams: {
        ...(search !== undefined && search !== '' ? { search } : {}),
        ...(page !== undefined ? { page } : {}),
        ...(limit !== undefined ? { limit } : {}),
      },
    }),
  );

  return response.data;
}
