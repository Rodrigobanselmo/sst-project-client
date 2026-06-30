import { AcgihRiskCorrelationRoutes } from '@v2/constants/routes/acgih-risk-correlation.routes';
import { api } from 'core/services/apiClient';

import type {
  IAcgihConsolidateParams,
  IAcgihConsolidateResponse,
  IAcgihRiskCorrelationApplyParams,
  IAcgihRiskCorrelationApplyResponse,
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

/**
 * Frente A.3 — consolida (cria) os vínculos ACGIH/BEI × Fatores de Risco. Exige
 * confirmText literal. O servidor reexecuta o preview e cria apenas vínculos
 * BiologicalIndicatorToRisk para itens promovidos, sem bloqueios e com status
 * elegível. `dryRun=true` simula sem gravar. Nenhuma correlação é enviada pelo
 * Client.
 */
export async function applyAcgihRiskCorrelation(
  params: IAcgihRiskCorrelationApplyParams,
): Promise<IAcgihRiskCorrelationApplyResponse> {
  const response = await api.post<IAcgihRiskCorrelationApplyResponse>(
    AcgihRiskCorrelationRoutes.APPLY,
    {
      acgihBeiIndicatorIds: params.acgihBeiIndicatorIds,
      dryRun: params.dryRun,
      confirmText: params.confirmText,
    },
  );
  return response.data;
}

/**
 * Fix — consolida (promove) TODOS os ACGIH/BEI da correlação (os 65) como
 * indicador oficial. Exige confirmText literal. O servidor reexecuta o preview
 * e cria apenas OccupationalBiologicalIndicator (idempotente por item); não cria
 * vínculos de risco. Nenhuma seleção/correlação é enviada pelo Client.
 */
export async function consolidateAcgihOfficialIndicators(
  params: IAcgihConsolidateParams,
): Promise<IAcgihConsolidateResponse> {
  const response = await api.post<IAcgihConsolidateResponse>(
    AcgihRiskCorrelationRoutes.CONSOLIDATE,
    {
      confirmText: params.confirmText,
    },
  );
  return response.data;
}
