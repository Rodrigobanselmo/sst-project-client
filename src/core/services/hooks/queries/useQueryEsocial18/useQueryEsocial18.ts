import { useQuery } from 'react-query';

import { StatusEnum } from 'project/enum/status.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEsocialTable18Mot } from 'core/interfaces/api/IEsocial';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryEsocial18Table {
  search?: string | null;
  companyId?: string;
}

export const queryEsocial18Tables = async (
  { skip, take }: IPagination,
  query: IQueryEsocial18Table,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<IEsocialTable18Mot[]>>(
    `${ApiRoutesEnum.ESOCIAL18TABLES}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryEsocial18Tables(
  page = 1,
  query = {} as IQueryEsocial18Table,
  take = 20,
) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = user?.companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.ESOCIAL18TABLES, page, { ...pagination, ...query, companyId }],
    () => queryEsocial18Tables(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IEsocialTable18Mot[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
