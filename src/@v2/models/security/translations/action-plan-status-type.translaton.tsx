import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';

export const ActionPlanStatusTypeTranslate: Record<
  ActionPlanStatusEnum,
  string
> = {
  [ActionPlanStatusEnum.PENDING]: 'Pendente',
  [ActionPlanStatusEnum.PROGRESS]: 'Iniciado',
  [ActionPlanStatusEnum.DONE]: 'Concluído',
  [ActionPlanStatusEnum.CANCELED]: 'Cancelado',
  [ActionPlanStatusEnum.REJECTED]: 'Rejeitado',
};
