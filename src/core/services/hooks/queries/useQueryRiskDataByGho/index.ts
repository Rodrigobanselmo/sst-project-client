import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskData } from '../../../../interfaces/api/IRiskData';
import { isEmptyRiskData } from '../../mutations/checklist/riskData/useMutUpsertManyRiskData';

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
      onSuccess: (data) => {
        // const isFirst = data?.length == 1;
        // if (isFirst && isEmptyRiskData(data[0]))
        //   queryClient.invalidateQueries([QueryEnum.GHO]);
        // if (isFirst && isEmptyRiskData(data[0])) alert(9);
      },
    },
  );

  return { ...query, data: data || [] };
}
