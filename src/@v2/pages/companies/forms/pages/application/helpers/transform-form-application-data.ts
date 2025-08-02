import { IFormApplicationFormFields } from '../schema/form-application.schema';
import { FormIdentifierTypeEnum } from '@v2/models/form/enums/form-identifier-type.enum';
import { FormQuestionTypeEnum } from '@v2/models/form/enums/form-question-type.enum';

function mapIdentifierTypeToQuestionType(
  identifierType: FormIdentifierTypeEnum,
): FormQuestionTypeEnum {
  return FormQuestionTypeEnum.RADIO;
}

export function transformFormApplicationDataToApiFormat(
  data: IFormApplicationFormFields,
) {
  if (data.sections.length === 0) {
    throw new Error('Não há seções para aplicar o questionário');
  }

  const identifierSection = data.sections[0];

  const identifier = {
    name: data.name,
    description: identifierSection.description,
    questions: identifierSection.items.map((item) => ({
      id: item.id,
      required: item.required,
      details: {
        text: item.content,
        type: mapIdentifierTypeToQuestionType(item.type.value),
        identifierType: item.type.value,
        acceptOther: false,
      },
      options:
        item.options?.map((option, optionIndex) => ({
          id: option.apiId,
          text: option.label,
          value: optionIndex + 1,
        })) || [],
    })),
  };

  return identifier;
}
