import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IExamsByHierarchyRiskData } from 'core/interfaces/api/IExam';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryExamHierarchy {
  search?: string | null;
  companyId?: string;
  hierarchyId?: string;
  employeeId?: number;
  skipAllExams?: boolean;
}

export const queryExams = async (
  { skip, take }: IPagination,
  query: IQueryExamHierarchy,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);

  const response = await api.get<
    IPaginationResult<IExamsByHierarchyRiskData[]>
  >(
    `${ApiRoutesEnum.EXAM}/hierarchy/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryExamsHierarchy(
  page = 1,
  query = {} as IQueryExamHierarchy,
) {
  const { companyId: userCompanyId } = useGetCompanyId();
  const pagination: IPagination = {
    // skip: (page - 1) * (take || 20),
    // take: take || 20,
  };

  const companyId = userCompanyId;

  const { data, ...result } = useQuery(
    [QueryEnum.EXAMS_RISK_DATA, page, { ...pagination, companyId, ...query }],
    () => queryExams(pagination, { companyId, ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      // enabled: page != 0,
    },
  );

  const response = {
    data: data?.data || ([] as IExamsByHierarchyRiskData[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
