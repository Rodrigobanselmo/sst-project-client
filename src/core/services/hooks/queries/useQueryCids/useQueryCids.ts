import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICid } from 'core/interfaces/api/ICid';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryCid {
  search?: string | null;
  companyId?: string;
}

export const queryCids = async (
  { skip, take }: IPagination,
  query: IQueryCid,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<ICid[]>>(
    `${ApiRoutesEnum.CID}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryCids(page = 1, query = {} as IQueryCid, take = 20) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = user?.companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.CID, page, { ...pagination, ...query, companyId }],
    () => queryCids(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as ICid[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
