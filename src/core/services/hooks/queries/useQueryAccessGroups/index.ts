import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEmployee } from 'core/interfaces/api/IEmployee';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryEmployee {
  cpf?: string;
  name?: string;
  search?: string | null;
  companyId?: string;
  hierarchyId?: string;
}

export const queryEmployees = async (
  { skip, take }: IPagination,
  query: IQueryEmployee,
) => {
  console.log(skip, take, query);
  if ('hierarchyId' in query && !query.hierarchyId)
    return { data: [], count: 0 };

  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IEmployee[]>>(
    `${ApiRoutesEnum.EMPLOYEES}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryEmployees(
  page = 1,
  query = {} as IQueryEmployee,
  take = 20,
) {
  const { companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [QueryEnum.EMPLOYEES, page, { ...query, companyId }],
    () => queryEmployees(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IEmployee[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
