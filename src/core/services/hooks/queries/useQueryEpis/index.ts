import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IEpi } from 'core/interfaces/api/IEpi';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryEpi {
  ca?: string;
  equipment?: string;
}

export const queryEpis = async (
  { skip, take }: IPagination,
  query: IQueryEpi,
) => {
  const cleaned = Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) => typeof value === 'string' && value.trim().length > 0,
    ),
  );
  const queries = queryString.stringify(cleaned);

  const response = await api.get<IPaginationResult<IEpi[]>>(
    `${ApiRoutesEnum.EPI}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

/** `page` é 0-based (EpiSelect usa 0). */
export function useQueryEpis(
  page = 0,
  query = {} as IQueryEpi,
  take: number,
  options?: { enabled?: boolean },
) {
  const pagination: IPagination = {
    skip: Math.max(0, page) * (take || 20),
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [QueryEnum.EPIS, page, { ...pagination, ...query }],
    () => queryEpis(pagination, query),
    {
      staleTime: 1000 * 60 * 60,
      enabled: options?.enabled !== false,
    },
  );

  const response = {
    data: data?.data || ([] as IEpi[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
