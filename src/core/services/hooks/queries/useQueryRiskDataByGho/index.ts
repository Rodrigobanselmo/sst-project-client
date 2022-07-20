import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskData } from '../../../../interfaces/api/IRiskData';
import { sortRiskData } from '../useQueryRiskData';

export const queryRiskData = async (
  companyId: string,
  riskGroupId: string,
  homogeneousGroupId: string,
): Promise<IRiskData[]> => {
  const response = await api.get<IRiskData[]>(
    `${ApiRoutesEnum.RISK_DATA}/${companyId}/${riskGroupId}/homogeneous/${homogeneousGroupId}`,
  );

  return response.data;
};

export function useQueryRiskDataByGho(
  riskGroupId: string,
  homogeneousGroupId: string,
): IReactQuery<IRiskData[]> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.RISK_DATA, companyId, riskGroupId, homogeneousGroupId],
    () =>
      companyId
        ? queryRiskData(companyId, riskGroupId, homogeneousGroupId)
        : <Promise<IRiskData[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!companyId && !!riskGroupId && !!homogeneousGroupId,
    },
  );

  return { ...query, data: data || [] };
}
