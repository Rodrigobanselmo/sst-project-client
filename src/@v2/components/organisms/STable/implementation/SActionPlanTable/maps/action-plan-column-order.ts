import { ActionPlanColumnsEnum } from '../enums/action-plan-columns.enum';

export const ACTION_PLAN_GROUPED_COLUMN_ORDER = [
  ActionPlanColumnsEnum.CHECK_BOX,
  ActionPlanColumnsEnum.ID,
  ActionPlanColumnsEnum.ORIGIN,
  ActionPlanColumnsEnum.RISK,
  ActionPlanColumnsEnum.GENERATE_SOURCE,
  ActionPlanColumnsEnum.LEVEL,
  ActionPlanColumnsEnum.EXPOSED_WORKERS,
  ActionPlanColumnsEnum.RECOMMENDATION,
  ActionPlanColumnsEnum.STATUS,
  ActionPlanColumnsEnum.EFFECTIVENESS,
  ActionPlanColumnsEnum.RESPONSIBLE,
  ActionPlanColumnsEnum.CREATED_AT,
  ActionPlanColumnsEnum.UPDATED_AT,
  ActionPlanColumnsEnum.VALID_DATE,
  ActionPlanColumnsEnum.COMMENT,
] as const;

export const ACTION_PLAN_LINKS_COLUMN_ORDER = [
  ActionPlanColumnsEnum.CHECK_BOX,
  ActionPlanColumnsEnum.ID,
  ActionPlanColumnsEnum.RECOMMENDATION,
  ActionPlanColumnsEnum.OPERATIONAL_GROUP,
  ActionPlanColumnsEnum.RISK,
  ActionPlanColumnsEnum.ORIGIN,
  ActionPlanColumnsEnum.LEVEL,
  ActionPlanColumnsEnum.EXPOSED_WORKERS,
  ActionPlanColumnsEnum.STATUS,
  ActionPlanColumnsEnum.RESPONSIBLE,
  ActionPlanColumnsEnum.VALID_DATE,
  ActionPlanColumnsEnum.COMMENT,
  ActionPlanColumnsEnum.GENERATE_SOURCE,
  ActionPlanColumnsEnum.EFFECTIVENESS,
  ActionPlanColumnsEnum.CREATED_AT,
  ActionPlanColumnsEnum.UPDATED_AT,
] as const;
