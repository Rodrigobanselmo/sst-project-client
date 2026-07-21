/**
 * Copy de UI para estados do drawer de explicabilidade FRPS.
 * Separado do JSX para reuso em testes e consistência de labels.
 */

export const FRPS_EXPLAINABILITY_UI_COPY = {
  conceptualValidatedLabel: 'Conhecimento conceitual validado',
  contextualGeneratedLabel: 'Justificativa gerada para esta análise',
  commonAwaitingContextualTitle: 'Conhecimento técnico disponível',
  commonAwaitingContextualBody:
    'Esta explicação conceitual já foi validada e pode ser reutilizada. Gere agora a justificativa específica desta análise, baseada nos resultados deste formulário.',
  generateContextualButton: 'Gerar justificativa desta análise',
  commonConceptualUnavailableTitle: 'Explicação conceitual ainda não disponível',
} as const;
