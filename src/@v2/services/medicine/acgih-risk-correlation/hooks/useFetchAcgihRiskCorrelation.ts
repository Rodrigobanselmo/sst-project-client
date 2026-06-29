import { useFetch } from '@v2/hooks/api/useFetch';

import { getAcgihRiskCorrelationPreview } from '../service/acgih-risk-correlation.service';
import type { IAcgihRiskCorrelationParams } from '../service/acgih-risk-correlation.types';
import { acgihRiskCorrelationQueryKeys } from './acgih-risk-correlation.query-keys';

export const useFetchAcgihRiskCorrelation = (
  params: IAcgihRiskCorrelationParams,
  enabled = true,
) =>
  useFetch({
    queryKey: acgihRiskCorrelationQueryKeys.preview(params),
    queryFn: () => getAcgihRiskCorrelationPreview(params),
    enabled,
    refetchOnMount: true,
  });
