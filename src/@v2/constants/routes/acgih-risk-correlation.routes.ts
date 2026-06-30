/**
 * Frente A.1/A.2 — preview somente leitura da correlação ACGIH/BEI × Fatores de
 * Risco. Frente A.3 — apply real (escrita controlada apenas em
 * BiologicalIndicatorToRisk). MASTER-only no servidor.
 */
export const AcgihRiskCorrelationRoutes = {
  PREVIEW:
    '/v2/master/biological-indicators/acgih-risk-correlation/preview',
  APPLY: '/v2/master/biological-indicators/acgih-risk-correlation/apply',
} as const;
