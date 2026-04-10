import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import {
  FormPreliminaryLibraryCategoryApi,
  FormPreliminaryLibraryQuestionListItemApi,
  FormPreliminaryLibraryQuestionTypeApi,
} from '../../types/form-preliminary-library-api.types';

export interface CreateFormPreliminaryLibraryQuestionOptionInput {
  text: string;
  order: number;
  value?: number | null;
}

export interface CreateFormPreliminaryLibraryQuestionParams {
  companyId: string;
  name: string;
  questionText: string;
  questionType: FormPreliminaryLibraryQuestionTypeApi;
  category: FormPreliminaryLibraryCategoryApi;
  identifierType: FormIdentifierTypeEnum;
  acceptOther: boolean;
  options: CreateFormPreliminaryLibraryQuestionOptionInput[];
}

export async function createFormPreliminaryLibraryQuestion({
  companyId,
  ...body
}: CreateFormPreliminaryLibraryQuestionParams) {
  const response = await api.post<FormPreliminaryLibraryQuestionListItemApi>(
    bindUrlParams({
      path: FormRoutes.FORM_PRELIMINARY_LIBRARY.QUESTIONS,
      pathParams: { companyId },
    }),
    body,
  );

  return response.data;
}
