import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';
import { sortString } from 'core/utils/sorts/string.sort';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskData } from '../../../../interfaces/api/IRiskData';

export const sortRiskData = (data: IRiskData[]) => {
  return data.map((riskData) => {
    return {
      ...riskData,
      adms: (riskData.adms || []).sort((a, b) => sortString(a, b, 'medName')),
      generateSources: (riskData.generateSources || []).sort((a, b) =>
        sortString(a, b, 'name'),
      ),
      engs: (riskData.engs || []).sort((a, b) => sortString(a, b, 'medName')),
      epis: (riskData.epis || []).sort((a, b) => sortString(a, b, 'ca')),
      recs: (riskData.recs || []).sort((a, b) => sortString(a, b, 'recName')),
    };
  });
};

export const queryRiskData = async (
  companyId: string,
  riskGroupId: string,
  riskId: string,
): Promise<IRiskData[]> => {
  const response = await api.get<IRiskData[]>(
    `${ApiRoutesEnum.RISK_DATA}/${companyId}/${riskGroupId}/${riskId}`,
  );

  return sortRiskData(response.data);
};

export function useQueryRiskData(
  riskGroupId: string,
  riskId: string,
): IReactQuery<IRiskData[]> {
  const { companyId } = useGetCompanyId();

  const { data, ...query } = useQuery(
    [QueryEnum.RISK_DATA, companyId, riskGroupId, riskId],
    () =>
      companyId
        ? queryRiskData(companyId, riskGroupId, riskId)
        : <Promise<IRiskData[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!companyId && !!riskGroupId && !!riskId,
    },
  );

  return { ...query, data: data || [] };
}
