import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IEpi } from 'core/interfaces/api/IEpi';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryEpi {
  ca: string;
}

export const queryEpis = async (
  { skip, take }: IPagination,
  query: IQueryEpi,
) => {
  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IEpi[]>>(
    `${ApiRoutesEnum.EPI}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryEpis(page = 0, query = {} as IQueryEpi, take: number) {
  const pagination: IPagination = {
    skip: page * 20,
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [QueryEnum.EPIS, page, query],
    () => queryEpis(pagination, query),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IEpi[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
