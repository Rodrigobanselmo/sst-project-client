import { TaskOrderByEnum } from '@v2/services/tasks/task/browse-task/service/browse-task.service';

type OrderByTranslationMap = Record<TaskOrderByEnum, string>;

export const orderByTaskTranslation: OrderByTranslationMap = {
  [TaskOrderByEnum.DESCRIPTION]: 'descrição',
  [TaskOrderByEnum.CREATED_AT]: 'data de criação',
  [TaskOrderByEnum.UPDATED_AT]: 'data de atualização',
  [TaskOrderByEnum.PRIORITY]: 'prioridade',
  [TaskOrderByEnum.STATUS]: 'status',
  [TaskOrderByEnum.DONE_DATE]: 'data de conclusão',
  [TaskOrderByEnum.END_DATE]: 'Vencimento',
  [TaskOrderByEnum.RESPONSIBLE]: 'responsável',
  [TaskOrderByEnum.CREATOR]: 'criador',
};
