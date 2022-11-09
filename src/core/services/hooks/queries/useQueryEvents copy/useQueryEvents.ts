import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IESocialEvent } from 'core/interfaces/api/IEvent';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryEvents {
  search?: string | null;
  companyId?: string;
}

export const queryEvent2220 = async (
  { skip, take }: IPagination,
  query: IQueryEvents,
) => {
  const companyId = query.companyId;

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const queries = queryString.stringify(query);

  const response = await api.get<IPaginationResult<IESocialEvent[]>>(
    `${ApiRoutesEnum.ESOCIAL_EVENT_2220}/event/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return {
    data: response.data?.data,
    count: response.data?.count,
  };
};

export function useQueryEvents(
  page = 1,
  query = {} as IQueryEvents,
  take = 20,
) {
  const { companyId: _companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = query.companyId || _companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.PREVIEW_EVENT_2220, page, { ...pagination, ...query, companyId }],
    () => queryEvent2220(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IESocialEvent[]),
    count: data?.count || 0,
  };

  return {
    ...result,
    companyId,
    data: response.data,
    count: response.count,
  };
}
