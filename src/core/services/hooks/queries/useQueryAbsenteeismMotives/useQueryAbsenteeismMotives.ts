import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { AbsenteeismMotive } from 'core/interfaces/api/IAbsenteeism';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryAbsenteeismMotive {
  search?: string | null;
  companyId?: string;
}

export const queryAbsenteeismMotives = async (
  { skip, take }: IPagination,
  query: IQueryAbsenteeismMotive,
) => {
  if ('search' in query && query.search === null) return { data: [], count: 0 };

  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<AbsenteeismMotive[]>>(
    `${ApiRoutesEnum.ABSENTEEISM_MOTIVES}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryAbsenteeismMotives(
  page = 1,
  query = {} as IQueryAbsenteeismMotive,
  take = 20,
) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const companyId = user?.companyId;

  const { data, ...result } = useQuery(
    [
      QueryEnum.ABSENTEEISM_MOTIVES,
      page,
      { ...pagination, ...query, companyId },
    ],
    () => queryAbsenteeismMotives(pagination, { ...query, companyId }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as AbsenteeismMotive[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
