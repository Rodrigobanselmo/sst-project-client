import { FormPreliminaryLibraryCategoryApi } from '../../types/form-preliminary-library-api.types';

export interface BrowseFormPreliminaryLibraryQuestionsParams {
  companyId: string;
  category?: FormPreliminaryLibraryCategoryApi;
  search?: string;
  page?: number;
  limit?: number;
}
