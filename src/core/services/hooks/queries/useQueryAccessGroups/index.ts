import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IAccessGroup } from 'core/interfaces/api/IAccessGroup';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { RoleEnum } from 'project/enum/roles.enums';

interface IQueryAccessGroup {
  cpf?: string;
  name?: string;
  search?: string | null;
  companyId?: string;
  hierarchyId?: string;
}

export const queryAccessGroups = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryAccessGroup,
) => {
  const queries = queryString.stringify(query);

  if ('search' in query && query.search === null) return { data: [], count: 0 };
  if (!companyId) return { data: [], count: 0 };

  const response = await api.get<IPaginationResult<IAccessGroup[]>>(
    `${ApiRoutesEnum.AUTH_GROUP}?take=${take}&skip=${skip}&${queries}`.replace(
      ':companyId',
      companyId,
    ),
  );

  return response.data;
};

export function useQueryAccessGroups(
  page = 1,
  query = {} as IQueryAccessGroup,
  take = 20,
) {
  const { user } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };

  const { data, ...result } = useQuery(
    [QueryEnum.AUTH_GROUP, user?.companyId, page, { ...pagination, ...query }],
    () => queryAccessGroups(pagination, user?.companyId || '', { ...query }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  const isMaster = user?.roles?.includes(RoleEnum.MASTER);

  const response = {
    data: data?.data || ([] as IAccessGroup[]),
    count: data?.count || 0,
  };

  const isSefaz = user?.companyId === '4a9538bf-be7a-4cc2-9f34-09fe0d486305';

  if (!isMaster && isSefaz) {
    response.data = response.data.filter(
      (group) => !group.name.includes('Administrado'),
    );
  }

  return { ...result, data: response.data, count: response.count };
}
