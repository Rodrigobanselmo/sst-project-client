import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { FormPreliminaryLibraryBlockDetailApi } from '../../types/form-preliminary-library-api.types';

export interface CreateFormPreliminaryLibraryBlockItemInput {
  libraryQuestionId: string;
  order: number;
}

export interface CreateFormPreliminaryLibraryBlockParams {
  companyId: string;
  name: string;
  description?: string | null;
  items: CreateFormPreliminaryLibraryBlockItemInput[];
}

export async function createFormPreliminaryLibraryBlock({
  companyId,
  ...body
}: CreateFormPreliminaryLibraryBlockParams) {
  const response = await api.post<FormPreliminaryLibraryBlockDetailApi>(
    bindUrlParams({
      path: FormRoutes.FORM_PRELIMINARY_LIBRARY.BLOCKS,
      pathParams: { companyId },
    }),
    body,
  );

  return response.data;
}
