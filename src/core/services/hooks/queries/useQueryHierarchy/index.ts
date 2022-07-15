import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IHierarchy } from 'core/interfaces/api/IHierarchy';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryHierarchy = async (id: string, companyId: string) => {
  const response = await api.get<IHierarchy>(
    `${ApiRoutesEnum.HIERARCHY}/${id}/${companyId}`,
  );
  return response.data;
};

export function useQueryHierarchy(id: string): IReactQuery<IHierarchy> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.HIERARCHY, companyId, id],
    () =>
      companyId && id
        ? queryHierarchy(id, companyId)
        : <Promise<IHierarchy>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || ({} as unknown as IHierarchy) };
}
