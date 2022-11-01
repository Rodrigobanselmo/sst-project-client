import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IGho } from 'core/interfaces/api/IGho';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryGho = async (id: string, companyId: string) => {
  const response = await api.get<IGho>(
    `${ApiRoutesEnum.GHO}/${id}/${companyId}`,
  );
  return response.data;
};

export function useQueryGho(id: string): IReactQuery<IGho> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.GHO, companyId, id],
    () =>
      companyId && id
        ? queryGho(id, companyId)
        : <Promise<IGho>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || ({} as unknown as IGho) };
}
