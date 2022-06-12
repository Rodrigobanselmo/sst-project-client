import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEnvironment } from 'core/interfaces/api/IEnvironment';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';
import { sortData } from 'core/utils/sorts/data.sort';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryEnvironments = async (
  companyId: string,
  workspaceId: string,
): Promise<IEnvironment[]> => {
  const response = await api.get<IEnvironment[]>(
    `${ApiRoutesEnum.ENVIRONMENTS.replace(':companyId', companyId).replace(
      ':workspaceId',
      workspaceId,
    )}`,
  );

  return response.data
    ? response.data.sort((a, b) => sortData(b, a, 'created_at'))
    : [];
};

export function useQueryEnvironments(): IReactQuery<IEnvironment[]> {
  const { companyId, workspaceId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.ENVIRONMENTS, companyId, workspaceId],
    () =>
      companyId && workspaceId
        ? queryEnvironments(companyId, workspaceId)
        : <Promise<IEnvironment[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
