import { useMutation, useQueryClient } from '@tanstack/react-query';

import { consolidateAcgihOfficialIndicators } from '../service/acgih-risk-correlation.service';
import type { IAcgihConsolidateParams } from '../service/acgih-risk-correlation.types';
import { acgihRiskCorrelationQueryKeys } from './acgih-risk-correlation.query-keys';

/**
 * Fix — mutation de consolidação completa dos ACGIH/BEI (os 65) como indicador
 * oficial. Em sucesso, invalida o preview de correlação para refletir os itens
 * recém-promovidos (promovidos 65 / não promovidos 0 na reexecução do servidor).
 */
export const useConsolidateAcgihOfficialIndicators = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IAcgihConsolidateParams) =>
      consolidateAcgihOfficialIndicators(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: acgihRiskCorrelationQueryKeys.all(),
      });
    },
  });
};
