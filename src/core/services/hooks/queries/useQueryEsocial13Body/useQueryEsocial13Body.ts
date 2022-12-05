import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { IEsocialTable13Body } from '../../../../interfaces/api/IEsocial';

export interface IQueryEsocial13Body {
  search?: string | null;
  companyId?: string;
}

export const queryEsocial13Body = async (
  { skip, take }: IPagination,
  query: IQueryEsocial13Body,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<IEsocialTable13Body[]>>(
    `${ApiRoutesEnum.ESOCIAL13TABLES}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryEsocial13Body(
  page = 1,
  query = {} as IQueryEsocial13Body,
  take = 20,
) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = user?.companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.ESOCIAL_13, page, { ...pagination, ...query, companyId }],
    () => queryEsocial13Body(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IEsocialTable13Body[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
