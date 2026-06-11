import { RecommendationTypeEnum } from '@v2/models/security/enums/recommendation-type.enum';
import { recommendationTypeTranslation } from '@v2/models/security/translations/recommendation-type.translation';

type RecommendationTypeSchema = {
  label: string;
  color: string;
  borderColor: string;
  backgroundColor: string;
  fontWeight: number;
};

export const ActionPlanRecommendationTypeMap: Record<
  RecommendationTypeEnum,
  RecommendationTypeSchema
> = {
  [RecommendationTypeEnum.ENG]: {
    label: recommendationTypeTranslation[RecommendationTypeEnum.ENG],
    color: 'success.dark',
    borderColor: 'success.main',
    backgroundColor: 'success.50',
    fontWeight: 700,
  },
  [RecommendationTypeEnum.ADM]: {
    label: recommendationTypeTranslation[RecommendationTypeEnum.ADM],
    color: 'warning.dark',
    borderColor: 'warning.main',
    backgroundColor: 'warning.50',
    fontWeight: 600,
  },
  [RecommendationTypeEnum.EPI]: {
    label: recommendationTypeTranslation[RecommendationTypeEnum.EPI],
    color: 'text.secondary',
    borderColor: 'grey.400',
    backgroundColor: 'grey.100',
    fontWeight: 500,
  },
};

export const getRecommendationTypeDisplay = (type: RecommendationTypeEnum) =>
  ActionPlanRecommendationTypeMap[type] ??
  ActionPlanRecommendationTypeMap[RecommendationTypeEnum.ADM];
