import { useQuery } from 'react-query';

import { selectUser } from 'store/reducers/user/userSlice';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useAppSelector } from 'core/hooks/useAppSelector';
import { IInvites } from 'core/interfaces/api/IInvites';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryUserInvites = async (email = '') => {
  if (!email) return [];

  const response = await api.get<IInvites[]>(
    `${ApiRoutesEnum.INVITES}/me/${email}`,
  );

  return response.data;
};

export function useQueryUserInvites(): IReactQuery<IInvites[]> {
  const user = useAppSelector(selectUser);
  const { data, ...query } = useQuery(
    [QueryEnum.INVITES_USER, user?.email],
    () =>
      user?.email
        ? queryUserInvites(user.email)
        : <Promise<IInvites[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || [] };
}
