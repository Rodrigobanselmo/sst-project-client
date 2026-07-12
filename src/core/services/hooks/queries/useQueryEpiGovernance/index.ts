import { useQuery } from 'react-query';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';

export type IEpiGovernance = {
  version: number | null;
  updatedAt: string | null;
  totalCount: number;
  daysSinceUpdate: number | null;
  isStale: boolean;
  staleThresholdDays: number;
};

export async function queryEpiGovernance(companyId?: string) {
  const params = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const response = await api.get<IEpiGovernance>(
    `${ApiRoutesEnum.EPI}/governance${params}`,
  );
  return response.data;
}

export function useQueryEpiGovernance() {
  const { companyId } = useGetCompanyId();

  return useQuery(
    [QueryEnum.EPIS, 'governance', companyId],
    () => queryEpiGovernance(companyId || undefined),
    {
      staleTime: 1000 * 60 * 5,
    },
  );
}
