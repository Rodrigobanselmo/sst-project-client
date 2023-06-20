import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IUserHistory } from 'core/interfaces/api/IUserHistory';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryUserHistory {
  search?: string | null;
  userId?: number;
  companyId?: string;
}

export const queryUsersHistory = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryUserHistory,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IUserHistory[]>>(
    `${ApiRoutesEnum.USERS_HISTORY}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryUsersHistory(
  page = 1,
  query = {} as IQueryUserHistory,
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
    [QueryEnum.USERS_HISTORY, _companyId, page, { ...query }],
    () => queryUsersHistory(pagination, _companyId || '', { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IUserHistory[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
