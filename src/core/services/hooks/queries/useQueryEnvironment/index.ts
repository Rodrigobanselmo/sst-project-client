import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IEnvironment } from 'core/interfaces/api/IEnvironment';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyMapReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';

export const queryEnvironment = async (
  id: string,
  workspaceId: string,
  companyId: string,
) => {
  const response = await api.get<IEnvironment>(
    `${ApiRoutesEnum.ENVIRONMENTS.replace(':companyId', companyId).replace(
      ':workspaceId',
      workspaceId,
    )}/${id}`,
  );
  console.log(response.data);
  return response.data;
};

export function useQueryEnvironment(id: string): IReactQuery<IEnvironment> {
  const { companyId, workspaceId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.ENVIRONMENT, companyId, workspaceId, id],
    () =>
      companyId && id && workspaceId
        ? queryEnvironment(id, workspaceId, companyId)
        : <Promise<IEnvironment>>emptyMapReturn(),
    {
      staleTime: 1000 * 60 * 60, // 60 minute
    },
  );

  return { ...query, data: data || ({} as unknown as IEnvironment) };
}
