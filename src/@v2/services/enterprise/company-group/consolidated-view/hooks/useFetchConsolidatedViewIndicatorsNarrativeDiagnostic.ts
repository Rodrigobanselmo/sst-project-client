import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useFetch } from '@v2/hooks/api/useFetch';
import { useEffect } from 'react';

import { readConsolidatedIndicatorsNarrativeDiagnostic } from '../service/consolidated-view-narrative.service';
import {
  buildConsolidatedIndicatorsNarrativeScopeKey,
  normalizeConsolidatedIndicatorsNarrativeScope,
} from '../service/consolidated-view-narrative.scope';
import { ReadConsolidatedIndicatorsNarrativeDiagnosticParams } from '../service/consolidated-view-narrative.types';
import { getConsolidatedIndicatorsNarrativeDiagnosticQueryKey } from './useMutateGenerateConsolidatedViewIndicatorsNarrativeDiagnostic';

const PROCESSING_FRESHNESS_MS = 60 * 60 * 1000;

export const useFetchConsolidatedViewIndicatorsNarrativeDiagnostic = (
  params: ReadConsolidatedIndicatorsNarrativeDiagnosticParams,
  enabled = true,
) => {
  const normalizedScope = normalizeConsolidatedIndicatorsNarrativeScope(params.scope);
  const scopeKey = buildConsolidatedIndicatorsNarrativeScopeKey(normalizedScope, {
    companyGroupId: params.companyGroupId,
    applicationIds: params.applicationIds ?? [],
  });

  const query = useFetch({
    queryKey: [
      ...getConsolidatedIndicatorsNarrativeDiagnosticQueryKey(
        params.companyGroupId,
        params.applicationIds,
      ),
      scopeKey,
    ],
    queryFn: () =>
      readConsolidatedIndicatorsNarrativeDiagnostic({
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
