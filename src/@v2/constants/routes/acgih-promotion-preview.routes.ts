/**
 * 4P.1B/4P.1C — endpoint somente leitura de preview/dry-run de promoção de
 * candidatos ACGIH/BEI a indicador oficial. Não cria/altera nenhum dado.
 */
export const AcgihPromotionPreviewRoutes = {
  PREVIEW: '/v2/master/biological-indicators/acgih-promotion/preview',
  // 4P.2A/4P.2B — apply/promote real (escrita, MASTER-only).
  APPLY: '/v2/master/biological-indicators/acgih-promotion/apply',
} as const;
