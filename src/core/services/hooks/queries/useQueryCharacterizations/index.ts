import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';
import { sortData } from 'core/utils/sorts/data.sort';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryCharacterizations = async (
  companyId: string,
  workspaceId: string,
): Promise<ICharacterization[]> => {
  const response = await api.get<ICharacterization[]>(
    `${ApiRoutesEnum.CHARACTERIZATIONS.replace(':companyId', companyId).replace(
      ':workspaceId',
      workspaceId,
    )}`,
  );

  return response.data
    ? response.data.sort((a, b) => sortData(b, a, 'created_at'))
    : [];
};

export function useQueryCharacterizations(): IReactQuery<ICharacterization[]> {
  const { companyId, workspaceId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.CHARACTERIZATIONS, companyId, workspaceId],
    () =>
      companyId && workspaceId
        ? queryCharacterizations(companyId, workspaceId)
        : <Promise<ICharacterization[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
