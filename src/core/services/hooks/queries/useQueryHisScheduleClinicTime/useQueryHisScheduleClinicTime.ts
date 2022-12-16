import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryClinicEmployeeHistHier {
  clinicId?: string;
  date?: Date;
}

interface IScheduleClinicTimeApi {
  time: string;
  id: number;
}

export const queryScheduleTimeExamEmployee = async (
  query: IQueryClinicEmployeeHistHier,
) => {
  const queries = queryString.stringify(query);

  if (!query.clinicId || !query.date) return [];

  const response = await api.get<IScheduleClinicTimeApi[]>(
    `${ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM}/schedule/clinic/time?${queries}`,
  );

  return response.data;
};

export function useQueryHisScheduleClinicTime(
  query = {} as IQueryClinicEmployeeHistHier,
) {
  const { data, ...result } = useQuery(
    [QueryEnum.EMPLOYEE_HISTORY_EXAM, 'schedule-clinic-time', { ...query }],
    () => queryScheduleTimeExamEmployee({ ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...result, data: data || [], count: data?.length || 0 };
}
