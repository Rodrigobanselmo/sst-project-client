import { AcgihPromotionPreviewRoutes } from '@v2/constants/routes/acgih-promotion-preview.routes';
import { api } from 'core/services/apiClient';

import type {
  IAcgihPromotionApplyParams,
  IAcgihPromotionApplyResponse,
  IAcgihPromotionPreviewParams,
  IAcgihPromotionPreviewResponse,
} from './acgih-promotion-preview.types';

/**
 * 4P.1C — consulta o preview/dry-run (somente leitura) de candidatos ACGIH/BEI
 * à promoção para indicador oficial. O servidor não cria nem altera dados.
 * `includeDivergenceDerived` só é enviado quando ligado.
 */
export async function getAcgihPromotionPreview(
  params: IAcgihPromotionPreviewParams,
): Promise<IAcgihPromotionPreviewResponse> {
  const response = await api.get<IAcgihPromotionPreviewResponse>(
    AcgihPromotionPreviewRoutes.PREVIEW,
    {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search,
        includeDivergenceDerived: params.includeDivergenceDerived
          ? 'true'
          : undefined,
      },
    },
  );
  return response.data;
}

/**
 * 4P.2B — promove os candidatos ACGIH/BEI elegíveis (cria indicadores oficiais
 * DRAFT na API). Exige confirmText literal. Sem lista de ids = aplica todos os
 * ELIGIBLE do preview atual no servidor.
 */
export async function applyAcgihPromotion(
  params: IAcgihPromotionApplyParams,
): Promise<IAcgihPromotionApplyResponse> {
  const response = await api.post<IAcgihPromotionApplyResponse>(
    AcgihPromotionPreviewRoutes.APPLY,
    {
      acgihBeiIndicatorIds: params.acgihBeiIndicatorIds,
      includeDivergenceDerived: params.includeDivergenceDerived,
      confirmText: params.confirmText,
    },
  );
  return response.data;
}
