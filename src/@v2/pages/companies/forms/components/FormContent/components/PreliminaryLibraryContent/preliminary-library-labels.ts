import { FormPreliminaryLibraryCategoryApi } from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';

export function translatePreliminaryLibraryCategory(
  category: FormPreliminaryLibraryCategoryApi,
): string {
  const map: Record<FormPreliminaryLibraryCategoryApi, string> = {
    DEMOGRAPHIC: 'Demográfica',
    ORGANIZATIONAL: 'Organizacional',
    SEGMENTATION: 'Segmentação',
    OTHER: 'Outra',
  };
  return map[category] ?? category;
}

export function translatePreliminaryLibraryQuestionType(type: string): string {
  if (type === 'SINGLE_CHOICE') return 'Escolha única';
  if (type === 'TEXT') return 'Texto';
  return type;
}
