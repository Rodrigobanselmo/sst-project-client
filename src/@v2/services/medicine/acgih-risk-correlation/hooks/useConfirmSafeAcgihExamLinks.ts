import { useMutation, useQueryClient } from '@tanstack/react-query';

import { confirmSafeAcgihExamLinks } from '../service/acgih-risk-correlation.service';
import type { IAcgihExamConfirmSafeParams } from '../service/acgih-risk-correlation.types';
import { acgihRiskCorrelationQueryKeys } from './acgih-risk-correlation.query-keys';

/**
 * Confirma vínculos ACGIH/BEI → Exame pendentes seguros. Em apply real,
 * invalida previews da correlação e de exame.
 */
export const useConfirmSafeAcgihExamLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IAcgihExamConfirmSafeParams) =>
      confirmSafeAcgihExamLinks(params),
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
