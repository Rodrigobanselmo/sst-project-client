import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskData } from '../../../../interfaces/api/IRiskData';

export const queryRiskData = async (
  companyId: string,
  hierarchyId: string,
): Promise<IRiskData[]> => {
  const response = await api.get<IRiskData[]>(
    `${ApiRoutesEnum.RISK_DATA}/${companyId}/hierarchy/${hierarchyId}`,
  );

  return response.data;
};

export function useQueryRiskDataByHierarchy(
  hierarchyId: string,
): IReactQuery<IRiskData[]> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.RISK_DATA, companyId, hierarchyId, QueryEnum.HIERARCHY],
    () =>
      companyId
        ? queryRiskData(companyId, hierarchyId)
        : <Promise<IRiskData[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!companyId && !!hierarchyId,
    },
  );

  return { ...query, data: data || [] };
}
