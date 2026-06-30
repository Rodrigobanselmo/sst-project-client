import { useQuery } from '@tanstack/react-query';

import { getAcgihExamPreview } from '../service/acgih-risk-correlation.service';
import { acgihRiskCorrelationQueryKeys } from './acgih-risk-correlation.query-keys';

/** Preview read-only do estado de exame por indicador ACGIH/BEI. */
export const useFetchAcgihExamPreview = () =>
  useQuery({
    queryKey: acgihRiskCorrelationQueryKeys.examPreview(),
    queryFn: () => getAcgihExamPreview(),
  });
