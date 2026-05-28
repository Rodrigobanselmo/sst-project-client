import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useFetch } from '@v2/hooks/api/useFetch';
import { useEffect } from 'react';
import { readIndicatorsNarrativeDiagnostic } from '../service/indicators-narrative-diagnostic.service';
import { ReadIndicatorsNarrativeDiagnosticParams } from '../service/indicators-narrative-diagnostic.types';
import { getIndicatorsNarrativeDiagnosticQueryKey } from './useMutateGenerateIndicatorsNarrativeDiagnostic';
import {
  buildIndicatorsNarrativeDiagnosticScopeKey,
  normalizeIndicatorsNarrativeScope,
} from '../service/indicators-narrative-diagnostic.scope';

const PROCESSING_FRESHNESS_MS = 60 * 60 * 1000;

export const useFetchIndicatorsNarrativeDiagnostic = (
  params: ReadIndicatorsNarrativeDiagnosticParams,
  enabled = true,
) => {
  const normalizedScope = normalizeIndicatorsNarrativeScope(params.scope);
  const scopeKey = buildIndicatorsNarrativeDiagnosticScopeKey(normalizedScope);

  const query = useFetch({
    queryKey: [
      ...getIndicatorsNarrativeDiagnosticQueryKey(params.companyId, params.formApplicationId),
      scopeKey,
    ],
    queryFn: () =>
      readIndicatorsNarrativeDiagnostic({
        ...params,
        scope: normalizedScope,
      }),
    enabled: enabled && !!params.companyId && !!params.formApplicationId,
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
    indicatorsNarrativeDiagnostic: query.data,
    isProcessing,
  };
};
