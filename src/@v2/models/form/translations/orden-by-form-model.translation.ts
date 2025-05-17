import { FormModelOrderByEnum } from '@v2/services/forms/form/browse-form-model/service/browse-form-model.types';

type OrderByTranslationMap = Record<FormModelOrderByEnum, string>;

export const orderByFormModelTranslation: OrderByTranslationMap = {
  [FormModelOrderByEnum.CREATED_AT]: 'data de criação',
  [FormModelOrderByEnum.UPDATED_AT]: 'data de atualização',
  [FormModelOrderByEnum.DESCRIPTION]: 'descrição',
  [FormModelOrderByEnum.NAME]: 'nome',
  [FormModelOrderByEnum.TYPE]: 'Tipo',
};
