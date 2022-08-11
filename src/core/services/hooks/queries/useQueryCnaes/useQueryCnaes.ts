import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { ICnae } from 'core/interfaces/api/ICompany';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryCnae {
  search?: string;
  code?: string;
}

export const queryCnaes = async (
  { skip, take }: IPagination,
  query: IQueryCnae,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<ICnae[]>>(
    `${ApiRoutesEnum.CNAES}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryCnaes(page = 1, query = {} as IQueryCnae, take = 20) {
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [QueryEnum.CNAES, page, { ...pagination, ...query }],
    () => queryCnaes(pagination, { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as ICnae[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
