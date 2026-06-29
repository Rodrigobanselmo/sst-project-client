import { AcgihPromotionPreviewRoutes } from '@v2/constants/routes/acgih-promotion-preview.routes';
import { api } from 'core/services/apiClient';

import type {
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
