import { FormApplicationOrderByEnum } from '@v2/services/forms/form-application/browse-form-application/service/browse-form-application.types';

type OrderByTranslationMap = Record<FormApplicationOrderByEnum, string>;

export const orderByFormApplicationTranslation: OrderByTranslationMap = {
  [FormApplicationOrderByEnum.CREATED_AT]: 'data de criação',
  [FormApplicationOrderByEnum.UPDATED_AT]: 'data de atualização',
  [FormApplicationOrderByEnum.DESCRIPTION]: 'descrição',
  [FormApplicationOrderByEnum.NAME]: 'nome',
  [FormApplicationOrderByEnum.END_DATE]: 'data de término',
  [FormApplicationOrderByEnum.START_DATE]: 'data de início',
  [FormApplicationOrderByEnum.STATUS]: 'status',
};
