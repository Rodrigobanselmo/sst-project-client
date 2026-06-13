import { useQuery } from '@tanstack/react-query';

import { readConsolidatedViewRiskAnalysis } from '../service/read-consolidated-view-risk-analysis.service';

export const getConsolidatedViewRiskAnalysisQueryKey = (
  companyGroupId: number,
  applicationIds: string[],
) =>
  [
    'consolidated-view',
    'risk-analysis',
    companyGroupId,
    [...applicationIds].sort().join('|'),
  ] as const;

export function useFetchConsolidatedViewRiskAnalysis(
  params: {
    companyGroupId: number;
    applicationIds: string[];
  },
  options?: { enabled?: boolean },
) {
  const query = useQuery({
    queryKey: getConsolidatedViewRiskAnalysisQueryKey(
      params.companyGroupId,
      params.applicationIds,
    ),
    queryFn: () =>
      readConsolidatedViewRiskAnalysis({
        companyGroupId: params.companyGroupId,
        applicationIds: params.applicationIds,
      }),
    enabled:
      (options?.enabled ?? true) &&
      params.companyGroupId > 0 &&
      params.applicationIds.length >= 2,
  });

  return {
    riskAnalysisData: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
