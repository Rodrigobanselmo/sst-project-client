import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployeeHierarchyHistory } from 'core/interfaces/api/IEmployee';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryEmployeeHistHier {
  search?: string;
  hierarchyId?: string;
  companyId?: string;
  employeeId?: number;
}

export const queryHisHierEmployee = async (
  { skip, take }: IPagination,
  query: IQueryEmployeeHistHier,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!query.companyId) return { data: [], count: 0 };

  const response = await api.get<
    IPaginationResult<IEmployeeHierarchyHistory[]>
  >(
    `${ApiRoutesEnum.EMPLOYEE_HISTORY_HIER}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryHisHierEmployee(
  page = 1,
  query = {} as IQueryEmployeeHistHier,
  take = 20,
  companyID?: string,
) {
  const { companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const _companyId = companyID || companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.EMPLOYEE_HISTORY_HIER, page, _companyId, { ...query }],
    () => queryHisHierEmployee(pagination, { ...query, companyId: _companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IEmployeeHierarchyHistory[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
