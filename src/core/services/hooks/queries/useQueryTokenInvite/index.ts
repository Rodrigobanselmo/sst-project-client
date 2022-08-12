import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { IInvites } from 'core/interfaces/api/IInvites';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryTokenInvites = async (token = '') => {
  if (!token) return null;

  const response = await api.get<IInvites>(
    `${ApiRoutesEnum.INVITES}/token/${token}`,
  );

  return response.data;
};

export function useQueryTokenInvite(token?: string) {
  const { data, ...query } = useQuery(
    [QueryEnum.INVITES_USER, 'token', token],
    () => queryTokenInvites(token),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || null };
}
