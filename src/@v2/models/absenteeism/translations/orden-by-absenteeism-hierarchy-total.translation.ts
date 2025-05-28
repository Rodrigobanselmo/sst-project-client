import { AbsenteeismHierarchyTotalOrderByEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';

type OrderByTranslationMap = Record<
  AbsenteeismHierarchyTotalOrderByEnum,
  string
>;

export const orderByAbsenteeismHierarchyTotalTranslation: OrderByTranslationMap =
  {
    [AbsenteeismHierarchyTotalOrderByEnum.AVERAGE_DAYS]: 'média de dias',
    [AbsenteeismHierarchyTotalOrderByEnum.TOTAL]: 'total',
    [AbsenteeismHierarchyTotalOrderByEnum.TOTAL_DAYS]: 'total de dias',
  };
