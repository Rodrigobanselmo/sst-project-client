import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { IEsocialTable17Injury } from '../../../../interfaces/api/IEsocial';

export interface IQueryEsocial17Injury {
  search?: string | null;
  companyId?: string;
}

export const queryEsocial17Injury = async (
  { skip, take }: IPagination,
  query: IQueryEsocial17Injury,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<IEsocialTable17Injury[]>>(
    `${ApiRoutesEnum.ESOCIAL17TABLES}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryEsocial17Injury(
  page = 1,
  query = {} as IQueryEsocial17Injury,
  take = 20,
) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = user?.companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.ESOCIAL_17, page, { ...pagination, ...query, companyId }],
    () => queryEsocial17Injury(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IEsocialTable17Injury[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
