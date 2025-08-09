import { FormApplicationStatusEnum } from '../enums/form-status.enum';

export const FormApplicationStatusTranslate: Record<
  FormApplicationStatusEnum,
  string
> = {
  [FormApplicationStatusEnum.DONE]: 'Concluído',
  [FormApplicationStatusEnum.PENDING]: 'Pendente',
  [FormApplicationStatusEnum.PROGRESS]: 'Aceitando Respostas',
  [FormApplicationStatusEnum.INACTIVE]: 'Pausado',
  [FormApplicationStatusEnum.CANCELED]: 'Cancelado',
  [FormApplicationStatusEnum.TESTING]: 'Teste Interno',
};
