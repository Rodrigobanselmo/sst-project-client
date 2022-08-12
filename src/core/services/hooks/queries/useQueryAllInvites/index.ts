import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IAccessGroup } from 'core/interfaces/api/IAccessGroup';
import { IInvites } from 'core/interfaces/api/IInvites';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

interface IQueryAccessGroup {
  token?: string;
  email?: string;
  companyId?: string;
}

export const queryAccessGroups = async (
  { skip, take }: IPagination,
  companyId: string,
  query: IQueryAccessGroup,
) => {
  // const queries = queryString.stringify(query);
  // if ('search' in query && query.search === null) return { data: [], count: 0 };
  // if (!companyId) return { data: [], count: 0 };
  //   const response = await api.get<IInvites[]>(
  //     `${ApiRoutesEnum.INVITES}/me/${email}`,
  //   );
  // const response = await api.get<IPaginationResult<IInvites[]>>(
  //   `${ApiRoutesEnum.INVITES}/me/${email}?take=${take}&skip=${skip}&${queries}`.replace(
  //     ':companyId',
  //     companyId,
  //   ),
  // );
  // return response.data;
};

export function useQueryUserInvites(
  page = 1,
  query = {} as IQueryAccessGroup,
  take = 20,
) {
  // const { user } = useGetCompanyId();
  // const pagination: IPagination = {
  //   skip: (page - 1) * (take || 20),
  //   take: take || 20,
  // };
  // const { data, ...result } = useQuery(
  //   [QueryEnum.AUTH_GROUP, user?.companyId, page, { ...pagination, ...query }],
  //   () => queryAccessGroups(pagination, user?.companyId || '', { ...query }),
  //   {
  //     staleTime: 1000 * 60 * 60, // 1 hour
  //   },
  // );
  // const response = {
  //   data: data?.data || ([] as IAccessGroup[]),
  //   count: data?.count || 0,
  // };
  // return { ...result, data: response.data, count: response.count };
}

// export const queryUserInvites = async (email = '') => {
//   if (!email) return [];

//   const response = await api.get<IInvites[]>(
//     `${ApiRoutesEnum.INVITES}/me/${email}`,
//   );

//   return response.data;
// };

// export function useQueryUserInvites(): IReactQuery<IInvites[]> {
//   const user = useAppSelector(selectUser);
//   const { data, ...query } = useQuery(
//     [QueryEnum.INVITES_USER, user?.email],
//     () =>
//       user?.email
//         ? queryUserInvites(user.email)
//         : <Promise<IInvites[]>>emptyArrayReturn(),
//     {
//       staleTime: 1000 * 60 * 60, // 60 minute
//     },
//   );

//   return { ...query, data: data || [] };
// }
