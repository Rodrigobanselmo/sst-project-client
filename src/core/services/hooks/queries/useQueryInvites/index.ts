import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IInvites } from 'core/interfaces/api/IInvites';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryInvites = async (companyId = '') => {
  const response = await api.get<IInvites[]>(
    `${ApiRoutesEnum.INVITES}/${companyId}`,
  );

  return response.data;
};

export function useQueryInvites(): IReactQuery<IInvites[]> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.INVITES, companyId],
    () =>
      companyId
        ? queryInvites(companyId)
        : <Promise<IInvites[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || [] };
}
