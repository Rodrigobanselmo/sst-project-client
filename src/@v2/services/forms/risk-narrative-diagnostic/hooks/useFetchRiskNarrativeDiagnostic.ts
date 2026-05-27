import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';
import { useFetch } from '@v2/hooks/api/useFetch';
import { useEffect } from 'react';
import { readRiskNarrativeDiagnostic } from '../service/risk-narrative-diagnostic.service';
import { ReadRiskNarrativeDiagnosticParams } from '../service/risk-narrative-diagnostic.types';
import { getRiskNarrativeDiagnosticQueryKey } from './useMutateGenerateRiskNarrativeDiagnostic';

const PROCESSING_FRESHNESS_MS = 60 * 60 * 1000;

export const useFetchRiskNarrativeDiagnostic = (
  params: ReadRiskNarrativeDiagnosticParams,
  enabled = true,
) => {
  const query = useFetch({
    queryKey: [
      ...getRiskNarrativeDiagnosticQueryKey(params.companyId, params.formApplicationId),
      params.scope,
    ],
    queryFn: () => readRiskNarrativeDiagnostic(params),
    enabled: enabled && !!params.companyId && !!params.formApplicationId,
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
    riskNarrativeDiagnostic: query.data,
    isProcessing,
  };
};
