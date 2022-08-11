import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IAccessGroup } from 'core/interfaces/api/IAccessGroup';
import { ICompanyGroup } from 'core/interfaces/api/ICompanyGroup';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryCompanyGroup {
  cpf?: string;
  name?: string;
  search?: string | null;
  companyId?: string;
  hierarchyId?: string;
}

export const queryCompanyGroups = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryCompanyGroup,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<ICompanyGroup[]>>(
    `${ApiRoutesEnum.COMPANY_GROUP}?take=${take}&skip=${skip}&${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryCompanyGroups(
  page = 1,
  query = {} as IQueryCompanyGroup,
  take = 20,
) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [
      QueryEnum.COMPANY_GROUP,
      user?.companyId,
      page,
      { ...pagination, ...query },
    ],
    () => queryCompanyGroups(pagination, user?.companyId || '', { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const response = {
    data: data?.data || ([] as ICompanyGroup[]),
    count: data?.count || 0,
  };

  return { ...result, data: response.data, count: response.count };
}
