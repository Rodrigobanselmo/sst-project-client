import { FormPreliminaryLibraryBlockDetailApi } from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
import { IFormIdentifierItem } from '../schema/form-application.schema';
import { mapLibraryQuestionToFormIdentifierItem } from './map-library-question-to-form-identifier-item';

/**
 * Expande um bloco da biblioteca em vários itens do formulário da aplicação,
 * na ordem definida pelo bloco. Sem referências a ids da biblioteca.
 */
export function mapLibraryBlockToFormIdentifierItems(
  block: FormPreliminaryLibraryBlockDetailApi,
): IFormIdentifierItem[] {
  const sorted = [...(block.items ?? [])].sort((a, b) => a.order - b.order);
  return sorted.map((item) =>
    mapLibraryQuestionToFormIdentifierItem(item.library_question),
  );
}
