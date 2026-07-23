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
  globalCatalogLinkRequiredTitle: 'Explicação técnica indisponível',
  globalCatalogLinkRequiredBody:
    'Este item ainda não possui identidade global na Biblioteca. A explicação técnica ficará disponível quando o item for criado no catálogo do sistema.',
  contextualJustificationTitleSource:
    'Por que esta fonte geradora foi identificada nesta análise',
  contextualJustificationTitleRecommendation:
    'Por que esta recomendação foi selecionada para esta análise',
  contextualJustificationBadge: 'ANÁLISE CONTEXTUAL',
  contextualJustificationIntro:
    'Esta análise foi produzida especificamente para este formulário e complementa o conhecimento técnico validado acima.',
} as const;
