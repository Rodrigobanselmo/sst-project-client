import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import {
  IEmployee,
  IEmployeeExamsHistory,
} from 'core/interfaces/api/IEmployee';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryClinicEmployeeHistHier {
  date?: Date;
  companyId?: string;
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