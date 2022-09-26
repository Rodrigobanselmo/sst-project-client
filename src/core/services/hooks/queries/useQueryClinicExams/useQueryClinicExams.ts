import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExamToClinic } from 'core/interfaces/api/IExam';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryExam {
  search?: string | null;
  companyId?: string;
  examId?: number;
  endDate?: Date | null;
  orderBy?: string;
  groupId?: string;
  orderByDirection?: 'asc' | 'desc';
}

export const queryExams = async (
  { skip, take }: IPagination,
  query: IQueryExam,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IExamToClinic[]>>(
    `${ApiRoutesEnum.CLINIC_EXAM}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryClinicExams(
  page = 1,
  query = {} as IQueryExam,
  take = 20,
) {
  const { companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [QueryEnum.CLINIC_EXAMS, page, { companyId, ...pagination, ...query }],
    () => queryExams(pagination, { companyId, ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IExamToClinic[]),
    count: data?.count || 0,
  };

  return { ...result, companyId, data: response.data, count: response.count };
}
