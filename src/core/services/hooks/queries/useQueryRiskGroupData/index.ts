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
): Promise<IRiskGroupData[]> => {
  const response = await api.get<IRiskGroupData[]>(
    `${ApiRoutesEnum.RISK_GROUP_DATA}/${companyId}`,
  );

  return response.data;
};

export function useQueryRiskGroupData(
  priorCompanyId?: string,
): IReactQuery<IRiskGroupData[]> {
  const { companyId } = useGetCompanyId();

  const companySelectId = priorCompanyId || companyId;

  const { data, ...query } = useQuery(
    [QueryEnum.RISK_GROUP_DATA, companySelectId],
    () =>
      companySelectId
        ? queryGroupRiskData(companySelectId)
        : <Promise<IRiskGroupData[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      refetchOnWindowFocus: true,
    },
  );

  return { ...query, data: data || [] };
}
