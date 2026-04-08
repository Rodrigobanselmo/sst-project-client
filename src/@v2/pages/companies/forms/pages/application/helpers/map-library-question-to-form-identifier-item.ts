import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';
import { FormIdentifierTypeTranslate } from '@v2/models/form/translations/form-identifier-type.translation';
import { FormPreliminaryLibraryQuestionListItemApi } from '@v2/services/forms/form-preliminary-library/types/form-preliminary-library-api.types';
import { v4 } from 'uuid';
import { IFormIdentifierItem } from '../schema/form-application.schema';

/**
 * Copia uma pergunta da biblioteca para o formato do formulário da aplicação.
 * Não inclui qualquer id da biblioteca — apenas novos UUIDs de formulário.
 */
export function mapLibraryQuestionToFormIdentifierItem(
  libraryQuestion: FormPreliminaryLibraryQuestionListItemApi,
): IFormIdentifierItem {
  const rawType = libraryQuestion.identifier_type as FormIdentifierTypeEnum;
  if (!Object.values(FormIdentifierTypeEnum).includes(rawType)) {
    throw new Error('Tipo de identificador da biblioteca não suportado.');
  }

  const detailsQuestionType =
    libraryQuestion.question_type === 'TEXT'
      ? FormQuestionTypeEnum.LONG_TEXT
      : FormQuestionTypeEnum.RADIO;

  const optionsSorted = [...(libraryQuestion.options ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  const options: IFormIdentifierItem['options'] =
    libraryQuestion.question_type === 'TEXT'
      ? []
      : optionsSorted.map((o) => ({
          label: o.text,
          ...(o.value != null ? { responseValue: o.value } : {}),
        }));

  return {
    id: v4(),
    content: libraryQuestion.question_text,
    required: false,
    disabledEdition: false,
    disableDuplication: false,
    type: {
      value: rawType,
      label: FormIdentifierTypeTranslate[rawType],
    },
    detailsQuestionType,
    acceptOther: libraryQuestion.accept_other,
    options,
  };
}
