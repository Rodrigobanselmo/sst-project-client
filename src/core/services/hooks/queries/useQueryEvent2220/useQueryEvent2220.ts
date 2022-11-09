import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEvent2220 } from 'core/interfaces/api/IEvent';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryEvent2220 {
  search?: string | null;
  companyId?: string;
  all?: boolean;
  companiesIds?: string[];
}

export const queryEvent2220 = async (
  { skip, take }: IPagination,
  query: IQueryEvent2220,
) => {
  const companyId = query.companyId;

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IEvent2220[]>>(
    `${ApiRoutesEnum.ESOCIAL_EVENT_2220}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return {
    data: response.data?.data.map((r, i) => ({ id: i, ...r })),
    count: response.data?.count,
    error: response.data?.error,
  };
};

export function useQueryEvent2220(
  page = 1,
  query = {} as IQueryEvent2220,
  take = 20,
) {
  const { companyId: _companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = _companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.PREVIEW_EVENT_2220, page, { ...pagination, companyId, ...query }],
    () => queryEvent2220(pagination, { companyId, ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IEvent2220[]),
    count: data?.count || 0,
    error: data?.error,
  };

  return {
    ...result,
    companyId,
    data: response.data,
    count: response.count,
    error: response.error,
  };
}
