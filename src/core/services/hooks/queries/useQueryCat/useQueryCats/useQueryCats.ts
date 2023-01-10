import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICat } from 'core/interfaces/api/ICat';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryCat {
  search?: string | null;
  companyId?: string;
  companiesIds?: string[];
  onlyCompany?: boolean;
}

export const queryCats = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryCat,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<ICat[]>>(
    `${ApiRoutesEnum.CATS}?take=${take}&skip=${skip}&${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryCats(
  page = 1,
  query = {} as IQueryCat,
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
    [QueryEnum.CATS, _companyId, page, { ...query }],
    () => queryCats(pagination, _companyId || '', { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as ICat[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
