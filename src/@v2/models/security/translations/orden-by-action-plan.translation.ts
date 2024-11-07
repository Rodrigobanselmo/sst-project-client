import { ActionPlanOrderByEnum } from '@v2/services/security/action-plan/action-plan-browse/service/action-plan-characterization.types';

type OrderByTranslationMap = Record<ActionPlanOrderByEnum, string>;

export const ordenByActionPlanTranslation: OrderByTranslationMap = {
  [ActionPlanOrderByEnum.ORIGIN]: 'origem',
  [ActionPlanOrderByEnum.ORIGIN_TYPE]: 'tipo de origem',
  [ActionPlanOrderByEnum.CREATED_AT]: 'data de criação',
  [ActionPlanOrderByEnum.UPDATED_AT]: 'data de atualização',
  [ActionPlanOrderByEnum.LEVEL]: 'nível',
  [ActionPlanOrderByEnum.RECOMMENDATION]: 'recomendação',
  [ActionPlanOrderByEnum.RISK]: 'risco',
  [ActionPlanOrderByEnum.STATUS]: 'status',
  [ActionPlanOrderByEnum.START_DATE]: 'data de início',
  [ActionPlanOrderByEnum.DONE_DATE]: 'data de conclusão',
  [ActionPlanOrderByEnum.CANCEL_DATE]: 'data de cancelamento',
  [ActionPlanOrderByEnum.VALID_DATE]: 'data válida',
};
