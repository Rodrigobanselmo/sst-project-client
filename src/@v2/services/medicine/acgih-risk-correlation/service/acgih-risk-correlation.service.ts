import { AcgihRiskCorrelationRoutes } from '@v2/constants/routes/acgih-risk-correlation.routes';
import { api } from 'core/services/apiClient';

import type {
  IAcgihConsolidateParams,
  IAcgihConsolidateResponse,
  IAcgihExamLinkSyncParams,
  IAcgihExamLinkSyncResponse,
  IAcgihExamPreviewResponse,
  IAcgihExamResolveParams,
  IAcgihExamResolveResponse,
  IAcgihExamConfirmSafeParams,
  IAcgihExamConfirmSafeResponse,
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

/**
 * Vincula os exames corretos aos indicadores oficiais ACGIH/BEI (pré-requisito
 * do sync da Biblioteca Risco × Exame). Exige confirmText literal. `dryRun=true`
 * gera prévia sem escrita. O servidor faz o match e cria apenas
 * BiologicalIndicatorToExam (idempotente). Nada de match é enviado pelo Client.
 */
export async function syncAcgihExamLinks(
  params: IAcgihExamLinkSyncParams,
): Promise<IAcgihExamLinkSyncResponse> {
  const response = await api.post<IAcgihExamLinkSyncResponse>(
    AcgihRiskCorrelationRoutes.EXAM_LINK_SYNC,
    {
      confirmText: params.confirmText,
      dryRun: params.dryRun,
    },
  );
  return response.data;
}

/** Estado consolidado de exame por indicador ACGIH/BEI (read-only). */
export async function getAcgihExamPreview(): Promise<IAcgihExamPreviewResponse> {
  const response = await api.get<IAcgihExamPreviewResponse>(
    AcgihRiskCorrelationRoutes.EXAM_LINK_PREVIEW,
  );
  return response.data;
}

/**
 * Resolução em lote do vínculo ACGIH/BEI → Exame. Vincula candidatos únicos
 * seguros e cria exame sistêmico quando não houver candidato. Itens ambíguos
 * não são resolvidos automaticamente. Exige confirmText literal.
 */
export async function resolveAcgihExamLinks(
  params: IAcgihExamResolveParams,
): Promise<IAcgihExamResolveResponse> {
  const response = await api.post<IAcgihExamResolveResponse>(
    AcgihRiskCorrelationRoutes.EXAM_LINK_RESOLVE,
    {
      confirmText: params.confirmText,
      dryRun: params.dryRun,
      createMissingExams: params.createMissingExams,
      linkSafeMatches: params.linkSafeMatches,
    },
  );
  return response.data;
}

/**
 * Confirma vínculos ACGIH/BEI → Exame pendentes que passam na regra segura
 * determinante + matriz embutida. Exige confirmText literal. Não cria exame nem
 * regra da Biblioteca.
 */
export async function confirmSafeAcgihExamLinks(
  params: IAcgihExamConfirmSafeParams,
): Promise<IAcgihExamConfirmSafeResponse> {
  const response = await api.post<IAcgihExamConfirmSafeResponse>(
    AcgihRiskCorrelationRoutes.EXAM_LINK_CONFIRM_SAFE_PENDING,
    {
      confirmText: params.confirmText,
      dryRun: params.dryRun,
    },
  );
  return response.data;
}
