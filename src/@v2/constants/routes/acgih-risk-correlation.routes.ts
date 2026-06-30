/**
 * Frente A.1/A.2 — preview somente leitura da correlação ACGIH/BEI × Fatores de
 * Risco. Frente A.3 — apply real (escrita controlada apenas em
 * BiologicalIndicatorToRisk). MASTER-only no servidor.
 */
export const AcgihRiskCorrelationRoutes = {
  PREVIEW:
    '/v2/master/biological-indicators/acgih-risk-correlation/preview',
  APPLY: '/v2/master/biological-indicators/acgih-risk-correlation/apply',
  // Fix — consolidação completa: promove TODOS os ACGIH/BEI (os 65) a indicador
  // oficial. Cria APENAS OccupationalBiologicalIndicator. MASTER-only.
  CONSOLIDATE:
    '/v2/master/biological-indicators/acgih-risk-correlation/consolidate-official-indicators',
  // Vínculo ACGIH/BEI → Exame: cria APENAS BiologicalIndicatorToExam (pré-requisito
  // do sync da Biblioteca Risco × Exame). MASTER-only.
  EXAM_LINK_SYNC: '/v2/master/biological-indicators/acgih-exam-links/sync',
  EXAM_LINK_PREVIEW: '/v2/master/biological-indicators/acgih-exam-links/preview',
  EXAM_LINK_RESOLVE: '/v2/master/biological-indicators/acgih-exam-links/resolve',
  EXAM_LINK_CONFIRM_SAFE_PENDING:
    '/v2/master/biological-indicators/acgih-exam-links/confirm-safe-pending',
} as const;
