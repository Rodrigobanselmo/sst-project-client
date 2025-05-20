import { AbsenteeismEmployeeTotalOrderByEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-employee/service/browse-absenteeism-employee.service';

type OrderByTranslationMap = Record<
  AbsenteeismEmployeeTotalOrderByEnum,
  string
>;

export const orderByAbsenteeismEmployeeTotalTranslation: OrderByTranslationMap =
  {
    [AbsenteeismEmployeeTotalOrderByEnum.NAME]: 'nome',
    [AbsenteeismEmployeeTotalOrderByEnum.STATUS]: 'status',
    [AbsenteeismEmployeeTotalOrderByEnum.TOTAL]: 'total',
    [AbsenteeismEmployeeTotalOrderByEnum.TOTAL_DAYS]: 'total de dias',
  };
