import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskGroupData } from '../../../../interfaces/api/IRiskData';

export const queryGroupRiskData = async (
  companyId: string,
  workspaceId: string,
): Promise<IRiskGroupData[]> => {
  const response = await api.get<IRiskGroupData[]>(
    `${ApiRoutesEnum.RISK_GROUP_DATA}/${workspaceId}/${companyId}`,
  );

  return response.data;
};

export function useQueryRiskGroupData(): IReactQuery<IRiskGroupData[]> {
  const { companyId, workspaceId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.RISK_GROUP_DATA, companyId, workspaceId],
    () =>
      companyId
        ? queryGroupRiskData(companyId, workspaceId)
        : <Promise<IRiskGroupData[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
    },
  );

  return { ...query, data: data || [] };
}
