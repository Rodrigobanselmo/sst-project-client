import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IUser } from 'core/interfaces/api/IUser';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryUsers = async (companyId = '') => {
  const response = await api.get<IUser[]>(
    `${ApiRoutesEnum.USERS}/company/${companyId}`,
  );

  return response.data;
};

export function useQueryUsers(): IReactQuery<IUser[]> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.USERS, companyId],
    () =>
      companyId ? queryUsers(companyId) : <Promise<IUser[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || [] };
}
