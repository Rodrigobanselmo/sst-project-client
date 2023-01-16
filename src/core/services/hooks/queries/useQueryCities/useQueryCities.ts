import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICities } from 'core/interfaces/api/IUFCities';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryEsocialCities {
  search?: string | null;
  companyId?: string;
  addressCompany?: boolean;
}

export const queryEsocialCities = async (
  { skip, take }: IPagination,
  query: IQueryEsocialCities,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<ICities[]>>(
    `${
      !query.addressCompany
        ? ApiRoutesEnum.CITIES
        : ApiRoutesEnum.CITIES_ADDRESS_COMPANY
    }?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryCities(
  page = 1,
  query = {} as IQueryEsocialCities,
  take = 20,
) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = user?.companyId;

  const { data, ...result } = useQuery(
    [QueryEnum.CITIES, page, { ...pagination, ...query }],
    () => queryEsocialCities(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as ICities[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}

export function useFetchQueryCities() {
  const { user } = useGetCompanyId();

  const fetchCities = async (
    query = {} as IQueryEsocialCities,
    take = 20,
    page = 1,
  ) => {
    const pagination: IPagination = {
      skip: (page - 1) * (take || 20),
      take: take || 20,
    };

    const companyId = user?.companyId;

    const data = await queryClient
      .fetchQuery(
        [QueryEnum.CITIES, page, { ...pagination, ...query }],
        () => queryEsocialCities(pagination, { ...query, companyId }),
        {
          staleTime: 1000 * 60 * 10, // 10 minute
        },
      )
      .catch((e) => console.log(e));

    const response = {
      data: data?.data || ([] as ICities[]),
      count: data?.count || 0,
    };

    return { data: response.data, count: response.count };
  };

  return { fetchCities };
}
