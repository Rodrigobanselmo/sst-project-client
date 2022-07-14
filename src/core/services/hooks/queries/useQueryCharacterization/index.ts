import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryCharacterization = async (
  id: string,
  workspaceId: string,
  companyId: string,
) => {
  const response = await api.get<ICharacterization>(
    `${ApiRoutesEnum.CHARACTERIZATIONS.replace(':companyId', companyId).replace(
      ':workspaceId',
      workspaceId,
    )}/${id}`,
  );
  console.log(response.data);
  return response.data;
};

export function useQueryCharacterization(
  id: string,
): IReactQuery<ICharacterization> {
  const { companyId, workspaceId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.CHARACTERIZATION, companyId, workspaceId, id],
    () =>
      companyId && id && workspaceId
        ? queryCharacterization(id, workspaceId, companyId)
        : <Promise<ICharacterization>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || ({} as unknown as ICharacterization) };
}
