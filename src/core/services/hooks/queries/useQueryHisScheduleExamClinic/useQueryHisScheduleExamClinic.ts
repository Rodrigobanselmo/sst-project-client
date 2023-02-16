import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryClinicEmployeeHistHier {
  date?: Date;
  notAfterDate?: Date;
  companyId?: string;
  examIsAvaliation?: boolean;
  employeeId?: number;
}

export const queryHisExamEmployee = async (
  query: IQueryClinicEmployeeHistHier,
) => {
  const queries = queryString.stringify(query);

  if (!query.companyId) return [];

  const response = await api.get<IEmployee[]>(
    `${ApiRoutesEnum.EMPLOYEE_HISTORY_EXAM}/schedule/clinic?${queries}`,
  );

  return response.data;
};

export function useQueryHisScheduleExamClinic(
  query = {} as IQueryClinicEmployeeHistHier,
  companyID?: string,
) {
  const { companyId } = useGetCompanyId();

  const _companyId = companyID || companyId;

  const { data, ...result } = useQuery(
    [
      QueryEnum.EMPLOYEE_HISTORY_EXAM,
      'schedule-clinic',
      _companyId,
      { ...query },
    ],
    () => queryHisExamEmployee({ ...query, companyId: _companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...result, data: data || [], count: data?.length || 0 };
}

export function useFetchQueryHisScheduleExamClinic() {
  const { companyId } = useGetCompanyId();

  const fetchHisScheduleExam = async (
    query = {} as IQueryClinicEmployeeHistHier,
    companyID?: string,
  ) => {
    const _companyId = companyID || companyId;

    const response = await queryClient
      .fetchQuery(
        [
          QueryEnum.EMPLOYEE_HISTORY_EXAM,
          'schedule-clinic',
          _companyId,
          { ...query },
        ],
        () => queryHisExamEmployee({ ...query, companyId: _companyId }),
        {
          staleTime: 1000 * 60 * 10, // 10 minute
        },
      )
      .catch((e) => console.log(e));

    return { data: response || [], count: response?.length || 0 };
  };

  return { fetchHisScheduleExam };
}
