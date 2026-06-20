import { useMemo } from 'react';
import { useQuery } from 'react-query';

import { QueryEnum } from 'core/enums/query.enums';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { queryExams as queryRisksCompany } from 'core/services/hooks/queries/useQueryRisksCompany/useQueryRisksCompany';

import { filterRisksForDocumentRiskFilterModal } from '../helpers/document-risk-filter-scope.helpers';

type UseDocumentRiskFilterRisksParams = {
  companyId?: string;
  workspaceId?: string;
  scopeIds?: string[];
  enabled?: boolean;
};

export const useDocumentRiskFilterRisks = ({
  companyId,
  workspaceId,
  scopeIds = [],
  enabled = true,
}: UseDocumentRiskFilterRisksParams) => {
  const scopeKey = scopeIds.join(',');

  const { data, isLoading, isFetching } = useQuery(
    [
      QueryEnum.RISK,
      'company',
      'document-risk-filter',
      companyId,
      workspaceId,
      scopeKey,
    ],
    () =>
      queryRisksCompany(
        { skip: 0, take: 1000 },
        { companyId, workspaceId },
      ),
    {
      enabled: Boolean(enabled && companyId && workspaceId),
      staleTime: 1000 * 60 * 10,
    },
  );

  const risks = useMemo(
    () => filterRisksForDocumentRiskFilterModal(data?.data ?? [], scopeIds),
    [data?.data, scopeIds],
  );

  return {
    risks,
    isLoading: isLoading || isFetching,
    totalLinkedRisks: (data?.data ?? []).filter((risk) => risk.isPGR).length,
  };
};

export type DocumentRiskFilterRisksResult = {
  risks: IRiskFactors[];
  isLoading: boolean;
  totalLinkedRisks: number;
};
