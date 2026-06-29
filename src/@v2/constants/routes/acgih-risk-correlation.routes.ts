/**
 * Frente A.1/A.2 — endpoint somente leitura de preview da correlação ACGIH/BEI ×
 * Fatores de Risco. Não cria/altera nenhum dado (sem apply/sync nesta fase).
 */
export const AcgihRiskCorrelationRoutes = {
  PREVIEW:
    '/v2/master/biological-indicators/acgih-risk-correlation/preview',
} as const;
