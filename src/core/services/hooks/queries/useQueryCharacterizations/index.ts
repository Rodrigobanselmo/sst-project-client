import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICharacterization } from 'core/interfaces/api/ICharacterization';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';
import { sortDate } from 'core/utils/sorts/data.sort';

import { QueryEnum } from '../../../../enums/query.enums';

export interface IQueryCharacterization {
  search?: string;
  companyId?: string;
  workspaceId?: string;
}

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
    ? response.data.sort((a, b) => sortDate(b, a, 'created_at'))
    : [];
};

export function useQueryCharacterizations(
  page = 1,
  query = {} as IQueryCharacterization,
  take = 8,
) {
  const { companyId: _companyId, workspaceId: _workspaceId } =
    useGetCompanyId();

  const companyId = query.companyId || _companyId;
  const workspaceId = query.workspaceId || _workspaceId;

  const { data, ...queryData } = useQuery(
    [QueryEnum.CHARACTERIZATIONS, companyId, workspaceId],
    () =>
      companyId && workspaceId
        ? queryCharacterizations(companyId, workspaceId)
        : <Promise<ICharacterization[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...queryData, data: data || [] };
}
