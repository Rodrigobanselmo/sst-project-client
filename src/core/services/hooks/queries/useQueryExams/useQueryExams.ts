import { useQuery } from 'react-query';

import { StatusEnum } from 'project/enum/status.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExam } from 'core/interfaces/api/IExam';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryExam {
  name?: string;
  search?: string | null;
  companyId?: string;
  clinicId?: string;
  status?: StatusEnum;
  isAvaliation?: boolean;
  isAttendance?: boolean;
}

export const queryExams = async (
  { skip, take }: IPagination,
  query: IQueryExam,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<IExam[]>>(
    `${ApiRoutesEnum.EXAM}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryExams(page = 1, query = {} as IQueryExam, take = 20) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = user?.companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.EXAMS, page, { ...pagination, ...query, companyId }],
    () => queryExams(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IExam[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
