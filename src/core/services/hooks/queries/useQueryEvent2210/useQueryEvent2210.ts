import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEvent2210 } from 'core/interfaces/api/IEvent';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryEvent2210 {
  search?: string | null;
  companyId?: string;
  all?: boolean;
  companiesIds?: string[];
}

export const queryEvent2210 = async (
  { skip, take }: IPagination,
  query: IQueryEvent2210,
) => {
  const companyId = query.companyId;

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IEvent2210[]>>(
    `${ApiRoutesEnum.ESOCIAL_EVENT_2210}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );
  return {
    data: response.data?.data.map((r, i) => ({ id: i, ...r })),
    count: response.data?.count,
    error: response.data?.error,
  };
};

export function useQueryEvent2210(
  page = 1,
  query = {} as IQueryEvent2210,
  take = 20,
) {
  const { companyId: _companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = _companyId;

  const { data, ...result } = useQuery(
    [
      QueryEnum.PREVIEW_EVENT_2210,
      page,
      { ...pagination, companyId, ...query },
    ],
    () => queryEvent2210(pagination, { companyId, ...query }),
    { refetchOnMount: true },
  );

  const response = {
    data: data?.data || ([] as IEvent2210[]),
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
