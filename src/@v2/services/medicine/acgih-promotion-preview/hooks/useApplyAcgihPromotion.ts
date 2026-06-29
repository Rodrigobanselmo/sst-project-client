import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applyAcgihPromotion } from '../service/acgih-promotion-preview.service';
import type { IAcgihPromotionApplyParams } from '../service/acgih-promotion-preview.types';
import { acgihPromotionPreviewQueryKeys } from './acgih-promotion-preview.query-keys';

/**
 * 4P.2B — mutation de promoção real ACGIH/BEI → indicador oficial DRAFT.
 * Em sucesso, invalida o preview para refletir os itens já promovidos
 * (ALREADY_PROMOTED/bloqueados/skipped conforme a API reavalia).
 */
export const useApplyAcgihPromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IAcgihPromotionApplyParams) =>
      applyAcgihPromotion(params),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: acgihPromotionPreviewQueryKeys.all(),
      });
    },
  });
};
