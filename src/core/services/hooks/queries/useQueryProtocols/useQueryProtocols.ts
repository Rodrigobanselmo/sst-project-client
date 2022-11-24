import { useQuery } from 'react-query';

import { StatusEnum } from 'project/enum/status.enum';
import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProtocol } from 'core/interfaces/api/IProtocol';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryProtocol {
  name?: string;
  search?: string | null;
  companyId?: string;
  clinicId?: string;
  status?: StatusEnum;
}

export const queryProtocols = async (
  { skip, take }: IPagination,
  query: IQueryProtocol,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const companyId = query.companyId;
  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<IProtocol[]>>(
    `${ApiRoutesEnum.PROTOCOL}/${companyId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryProtocols(
  page = 1,
  query = {} as IQueryProtocol,
  take = 20,
) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = user?.companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.PROTOCOLS, page, { ...pagination, ...query, companyId }],
    () => queryProtocols(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as IProtocol[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
