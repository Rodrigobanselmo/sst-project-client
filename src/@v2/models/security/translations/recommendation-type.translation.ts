import { RecommendationTypeEnum } from '../enums/recommendation-type.enum';

export const recommendationTypeTranslation: Record<
  RecommendationTypeEnum,
  string
> = {
  [RecommendationTypeEnum.ENG]: 'Engenharia',
  [RecommendationTypeEnum.ADM]: 'Administrativa',
  [RecommendationTypeEnum.EPI]: 'EPI',
};

export const recommendationTypeHierarchyTooltip: Record<
  RecommendationTypeEnum,
  string
> = {
  [RecommendationTypeEnum.ENG]:
    'Engenharia — prioridade técnica 1 na hierarquia de controle',
  [RecommendationTypeEnum.ADM]:
    'Administrativa — prioridade técnica 2 na hierarquia de controle',
  [RecommendationTypeEnum.EPI]:
    'EPI — prioridade técnica 3 na hierarquia de controle',
};
