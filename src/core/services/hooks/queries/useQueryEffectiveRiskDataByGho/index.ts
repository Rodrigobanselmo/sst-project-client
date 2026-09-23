import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IReactQuery } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';
import { emptyArrayReturn } from 'core/utils/helpers/emptyFunc';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskData } from '../../../../interfaces/api/IRiskData';

export const queryEffectiveRiskDataByGho = async (
  companyId: string,
  riskGroupId: string,
  homogeneousGroupId: string,
  workspaceId?: string,
): Promise<IRiskData[]> => {
  const response = await api.get<IRiskData[]>(
    `${ApiRoutesEnum.RISK_DATA}/${companyId}/${riskGroupId}/homogeneous/${homogeneousGroupId}/effective`,
    {
      params: workspaceId ? { workspaceId } : undefined,
    },
  );

  return Array.isArray(response.data) ? response.data : [];
};

export function useQueryEffectiveRiskDataByGho(
  riskGroupId: string,
  homogeneousGroupId: string,
  enabled = true,
): IReactQuery<IRiskData[]> {
  const { companyId, workspaceId, router } = useGetCompanyId();
  const operationWorkspaceId =
    workspaceId || (router.query.tabWorkspaceId as string | undefined);

  const { data, ...query } = useQuery(
    [
      QueryEnum.RISK_DATA,
      companyId,
      riskGroupId,
      homogeneousGroupId,
      'effective',
      operationWorkspaceId,
    ],
    () =>
      companyId
        ? queryEffectiveRiskDataByGho(
            companyId,
            riskGroupId,
            homogeneousGroupId,
            operationWorkspaceId,
          )
        : <Promise<IRiskData[]>>emptyArrayReturn(),
    {
      staleTime: 1000 * 60 * 60,
      enabled:
        enabled && !!companyId && !!riskGroupId && !!homogeneousGroupId,
    },
  );

  const safeData = Array.isArray(data) ? data : data == null ? [] : [];

  return { ...query, data: safeData };
}
