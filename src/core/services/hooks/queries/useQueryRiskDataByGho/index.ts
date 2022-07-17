import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';
import { sortString } from 'core/utils/sorts/string.sort';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskData } from '../../../../interfaces/api/IRiskData';

export const queryRiskData = async (
  companyId: string,
  riskGroupId: string,
  homogeneousGroupId: string,
): Promise<IRiskData[]> => {
  const response = await api.get<IRiskData[]>(
    `${ApiRoutesEnum.RISK_DATA}/${companyId}/${riskGroupId}/homogeneous/${homogeneousGroupId}`,
  );

  return response.data.map((riskData) => {
    return {
      ...riskData,
      adms: (riskData.adms || []).sort((a, b) => sortString(a, b, 'name')),
      generateSources: (riskData.generateSources || []).sort((a, b) =>
        sortString(a, b, 'name'),
      ),
      engs: (riskData.engs || []).sort((a, b) => sortString(a, b, 'name')),
      epis: (riskData.epis || []).sort((a, b) => sortString(a, b, 'name')),
      recs: (riskData.recs || []).sort((a, b) => sortString(a, b, 'name')),
    };
  });
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
