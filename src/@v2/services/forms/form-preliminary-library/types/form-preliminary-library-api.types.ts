/**
 * Formato alinhado ao retorno Prisma/Nest da API v2 (snake_case nos campos do modelo).
 */

export type FormPreliminaryLibraryQuestionTypeApi = 'SINGLE_CHOICE' | 'TEXT';

export type FormPreliminaryLibraryCategoryApi =
  | 'DEMOGRAPHIC'
  | 'ORGANIZATIONAL'
  | 'SEGMENTATION'
  | 'OTHER';

export interface FormPreliminaryLibraryQuestionOptionApi {
  id: string;
  library_question_id: string;
  text: string;
  order: number;
  value: number | null;
}

export interface FormPreliminaryLibraryQuestionListItemApi {
  id: string;
  system: boolean;
  company_id: string | null;
  name: string;
  question_text: string;
  question_type: FormPreliminaryLibraryQuestionTypeApi;
  category: FormPreliminaryLibraryCategoryApi;
  identifier_type: string;
  accept_other: boolean;
  options: FormPreliminaryLibraryQuestionOptionApi[];
}

export interface BrowseFormPreliminaryLibraryQuestionsResponse {
  data: FormPreliminaryLibraryQuestionListItemApi[];
  count: number;
  page: number;
  limit: number;
}

export interface FormPreliminaryLibraryBlockListItemApi {
  id: string;
  system: boolean;
  company_id: string | null;
  name: string;
  description: string | null;
}

export interface BrowseFormPreliminaryLibraryBlocksResponse {
  data: FormPreliminaryLibraryBlockListItemApi[];
  count: number;
  page: number;
  limit: number;
}

export interface FormPreliminaryLibraryBlockItemApi {
  id: string;
  block_id: string;
  library_question_id: string;
  order: number;
  library_question: FormPreliminaryLibraryQuestionListItemApi;
}

export interface FormPreliminaryLibraryBlockDetailApi {
  id: string;
  system: boolean;
  company_id: string | null;
  name: string;
  description: string | null;
  items: FormPreliminaryLibraryBlockItemApi[];
}
