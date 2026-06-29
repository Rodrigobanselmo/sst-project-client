import { AcgihRiskCorrelationRoutes } from '@v2/constants/routes/acgih-risk-correlation.routes';
import { api } from 'core/services/apiClient';

import type {
  IAcgihRiskCorrelationParams,
  IAcgihRiskCorrelationResponse,
} from './acgih-risk-correlation.types';

/**
 * Frente A.2 — consulta o preview (somente leitura) da correlação ACGIH/BEI ×
 * Fatores de Risco. O servidor não cria nem altera dados. `search` é opcional
 * (filtro textual no servidor); o filtro fino é feito no cliente.
 */
export async function getAcgihRiskCorrelationPreview(
  params: IAcgihRiskCorrelationParams,
): Promise<IAcgihRiskCorrelationResponse> {
  const response = await api.get<IAcgihRiskCorrelationResponse>(
    AcgihRiskCorrelationRoutes.PREVIEW,
    {
      params: {
        search: params.search,
      },
    },
  );
  return response.data;
}
