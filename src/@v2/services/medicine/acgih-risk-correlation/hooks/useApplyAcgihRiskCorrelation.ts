import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applyAcgihRiskCorrelation } from '../service/acgih-risk-correlation.service';
import type { IAcgihRiskCorrelationApplyParams } from '../service/acgih-risk-correlation.types';
import { acgihRiskCorrelationQueryKeys } from './acgih-risk-correlation.query-keys';

/**
 * Frente A.3 — mutation de consolidação real dos vínculos ACGIH/BEI × Fatores
 * de Risco. Em sucesso (execução real, não dryRun), invalida o preview para
 * refletir os itens já vinculados (alreadyLinked na reexecução do servidor).
 */
export const useApplyAcgihRiskCorrelation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IAcgihRiskCorrelationApplyParams) =>
      applyAcgihRiskCorrelation(params),
    onSuccess: async (_data, variables) => {
      if (variables.dryRun) return;
      await queryClient.invalidateQueries({
        queryKey: acgihRiskCorrelationQueryKeys.all(),
      });
    },
  });
};
