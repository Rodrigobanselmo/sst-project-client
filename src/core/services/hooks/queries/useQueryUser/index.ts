import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IUser } from 'core/interfaces/api/IUser';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn, emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';
import { IUseOsReturn } from 'components/organisms/forms/CronSelector/hooks/useCronSelector';

export const queryUser = async (companyId: string, userId: number) => {
  const response = await api.get<IUser>(
    `${ApiRoutesEnum.USERS}/company/${companyId}/${userId}`,
  );

  return response.data;
};

export function useQueryUser({
  companyId: _companyId,
  userId,
}: {
  companyId?: string;
  userId?: number;
}): IReactQuery<IUser | undefined> {
  const { getCompanyId } = useGetCompanyId();
  const companyId = getCompanyId(_companyId);

  const { data, ...query } = useQuery(
    [QueryEnum.USERS, companyId, userId],
    () =>
      companyId && userId
        ? queryUser(companyId, userId)
        : <Promise<IUser>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
      onError: (error: any) => {
        const forbidenn = error?.response?.status === 403;
        if (forbidenn) {
          alert('Você não tem permissão para acessar essa página');
        }
      },
    },
  );

  return { ...query, data: data };
}
