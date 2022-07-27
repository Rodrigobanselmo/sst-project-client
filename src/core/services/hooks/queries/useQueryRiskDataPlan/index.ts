import { useQuery } from 'react-query';

import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IPagination } from 'core/interfaces/IPagination';
import { IPaginationResult } from 'core/interfaces/IReactQuery';
import { api } from 'core/services/apiClient';

import { QueryEnum } from '../../../../enums/query.enums';
import { IRiskData } from '../../../../interfaces/api/IRiskData';

interface IQueryRiskData {}

export const queryRiskDataPlan = async (
  companyId: string,
  workspaceId: string,
  riskGroupId: string,
  { skip, take }: IPagination,
  query: IQueryRiskData,
) => {
  const queries = queryString.stringify(query);
  const response = await api.get<IPaginationResult<IRiskData[]>>(
    `${ApiRoutesEnum.RISK_DATA}/action-plan/${companyId}/${workspaceId}/${riskGroupId}?take=${take}&skip=${skip}&${queries}`,
  );

  return response.data;
};

export function useQueryRiskDataPlan(
  riskGroupId: string,
  workspaceId: string,
  page = 0,
  query = {} as IQueryRiskData,
  take = 20,
) {
  const { companyId } = useGetCompanyId();
  const pagination: IPagination = {
    skip: (page - 1) * (take || 20),
    take: take || 20,
  };
  const { data, ...rest } = useQuery(
    [QueryEnum.RISK_DATA_PLAN, companyId, workspaceId, riskGroupId, page],
    () =>
      queryRiskDataPlan(companyId || '', workspaceId, riskGroupId, pagination, {
        ...query,
        companyId,
      }),
    {
      staleTime: 1000 * 60 * 60, // 1 hour
      enabled: !!companyId && !!riskGroupId,
    },
  );

  const response = {
    data: data?.data || ([] as IRiskData[]),
    count: data?.count || 0,
  };

  return { ...rest, data: response.data, count: response.count };
}
