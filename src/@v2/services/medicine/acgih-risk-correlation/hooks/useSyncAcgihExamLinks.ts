import { useMutation, useQueryClient } from '@tanstack/react-query';

import { syncAcgihExamLinks } from '../service/acgih-risk-correlation.service';
import type { IAcgihExamLinkSyncParams } from '../service/acgih-risk-correlation.types';
import { acgihRiskCorrelationQueryKeys } from './acgih-risk-correlation.query-keys';

/**
 * Mutation do vínculo ACGIH/BEI → Exame. Em sucesso de apply real (dryRun
 * false/omisso), invalida o preview de correlação para refletir os indicadores
 * que passaram a ter exame vinculado. dryRun=true (prévia) não invalida.
 */
export const useSyncAcgihExamLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IAcgihExamLinkSyncParams) =>
      syncAcgihExamLinks(params),
    onSuccess: async (_data, variables) => {
      if (variables.dryRun) return;
      await queryClient.invalidateQueries({
        queryKey: acgihRiskCorrelationQueryKeys.all(),
      });
    },
  });
};
