import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resolveAmbiguousAcgihExamLinks } from '../service/acgih-risk-correlation.service';
import type { IAcgihExamResolveAmbiguousParams } from '../service/acgih-risk-correlation.types';
import { acgihRiskCorrelationQueryKeys } from './acgih-risk-correlation.query-keys';

export const useResolveAmbiguousAcgihExamLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IAcgihExamResolveAmbiguousParams) =>
      resolveAmbiguousAcgihExamLinks(params),
    onSuccess: async (_data, variables) => {
      if (variables.dryRun) return;
      await queryClient.invalidateQueries({
        queryKey: acgihRiskCorrelationQueryKeys.all(),
      });
      await queryClient.invalidateQueries({
        queryKey: acgihRiskCorrelationQueryKeys.examPreview(),
      });
    },
  });
};
