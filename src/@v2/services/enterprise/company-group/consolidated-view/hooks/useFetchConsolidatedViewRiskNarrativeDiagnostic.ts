import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useFetch } from '@v2/hooks/api/useFetch';
import { useEffect } from 'react';

import { readConsolidatedRiskNarrativeDiagnostic } from '../service/consolidated-view-risk-narrative.service';
import {
  buildConsolidatedRiskNarrativeScopeKey,
  normalizeConsolidatedRiskNarrativeScope,
} from '../service/consolidated-view-risk-narrative.scope';
import { ReadConsolidatedRiskNarrativeDiagnosticParams } from '../service/consolidated-view-risk-narrative.types';
import { getConsolidatedRiskNarrativeDiagnosticQueryKey } from './useMutateGenerateConsolidatedViewRiskNarrativeDiagnostic';

const PROCESSING_FRESHNESS_MS = 60 * 60 * 1000;

export const useFetchConsolidatedViewRiskNarrativeDiagnostic = (
  params: ReadConsolidatedRiskNarrativeDiagnosticParams,
  enabled = true,
) => {
  const normalizedScope = normalizeConsolidatedRiskNarrativeScope(params.scope);
  const scopeKey = buildConsolidatedRiskNarrativeScopeKey(normalizedScope, {
    companyGroupId: params.companyGroupId,
    applicationIds: params.applicationIds ?? [],
  });

  const query = useFetch({
    queryKey: [
      ...getConsolidatedRiskNarrativeDiagnosticQueryKey(
        params.companyGroupId,
        params.applicationIds,
      ),
      scopeKey,
    ],
    queryFn: () =>
      readConsolidatedRiskNarrativeDiagnostic({
        ...params,
        scope: normalizedScope,
      }),
    enabled:
      enabled && params.companyGroupId > 0 && (params.applicationIds?.length ?? 0) >= 2,
    refetchOnMount: true,
  });

  const isProcessing =
    query.data?.status === FormAiAnalysisStatusEnum.PROCESSING &&
    Date.now() - new Date(query.data.updatedAt).getTime() < PROCESSING_FRESHNESS_MS;

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      void query.refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [isProcessing, query]);

  return {
    ...query,
    narrativeDiagnostic: query.data,
    isProcessing,
  };
};
