import { FormQuestionTypeEnum } from '../enums/form-question-type.enum';

export const FormQuestionTypeEnumTranslate: Record<
  FormQuestionTypeEnum,
  string
> = {
  [FormQuestionTypeEnum.TEXT]: 'Parágrafo',
  [FormQuestionTypeEnum.SHORT_TEXT]: 'Resposta curta',
  [FormQuestionTypeEnum.LONG_TEXT]: 'Texto longo',
  [FormQuestionTypeEnum.SELECT]: 'Lista suspensa',
  [FormQuestionTypeEnum.RADIO]: 'Múltipla escolha',
  [FormQuestionTypeEnum.CHECKBOX]: 'Caixas de seleção',
  [FormQuestionTypeEnum.DATE]: 'Data',
  [FormQuestionTypeEnum.NUMBER]: 'Número',
  [FormQuestionTypeEnum.SYSTEM]: 'Sistema',
};
