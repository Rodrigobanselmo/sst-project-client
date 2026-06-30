import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resolveAcgihExamLinks } from '../service/acgih-risk-correlation.service';
import type { IAcgihExamResolveParams } from '../service/acgih-risk-correlation.types';
import { acgihRiskCorrelationQueryKeys } from './acgih-risk-correlation.query-keys';

/**
 * Resolução em lote ACGIH/BEI → Exame. Em sucesso de apply real, invalida o
 * preview de correlação e o preview de exame.
 */
export const useResolveAcgihExamLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IAcgihExamResolveParams) =>
      resolveAcgihExamLinks(params),
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
