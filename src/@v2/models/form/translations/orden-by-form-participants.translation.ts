import { FormParticipantsOrderByEnum } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.types';

type OrderByTranslationMap = Record<FormParticipantsOrderByEnum, string>;

export const orderByFormParticipantsTranslation: OrderByTranslationMap = {
  [FormParticipantsOrderByEnum.NAME]: 'Nome',
  [FormParticipantsOrderByEnum.CPF]: 'CPF',
  [FormParticipantsOrderByEnum.EMAIL]: 'Email',
  [FormParticipantsOrderByEnum.STATUS]: 'Status',
  [FormParticipantsOrderByEnum.HIERARCHY_NAME]: 'Hierarquia',
  [FormParticipantsOrderByEnum.CREATED_AT]: 'Criado em',
  [FormParticipantsOrderByEnum.UPDATED_AT]: 'Atualizado em',
};
