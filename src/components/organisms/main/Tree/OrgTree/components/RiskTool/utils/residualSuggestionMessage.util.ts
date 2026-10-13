import { isResidualProbabilityEmpty } from './calculateSuggestedResidualProbability.util';

export type ResidualSuggestionMessage = {
  kind: 'matches' | 'differs' | 'suggestion' | 'insufficient';
  text: string;
  color: 'info.main' | 'warning.dark' | 'text.secondary';
  /** Só quando o residual da linha ainda não segue a sugestão. */
  canApplySuggestion: boolean;
};

/**
 * Relação entre o residual da linha e a sugestão automática.
 * Compara valores. Não afirma quem escolheu o residual.
 */
export const residualSuggestionMessage = (params: {
  hasRecommendations: boolean;
  residual?: number | null;
  suggested?: number | null;
}): ResidualSuggestionMessage | null => {
  if (!params.hasRecommendations) return null;

  if (params.suggested == null) {
    return {
      kind: 'insufficient',
      text: 'Sem dados suficientes para sugestão do sistema',
      color: 'text.secondary',
      canApplySuggestion: false,
    };
  }

  if (isResidualProbabilityEmpty(params.residual)) {
    return {
      kind: 'suggestion',
      text: `Sugestão do sistema: P${params.suggested}`,
      color: 'info.main',
      canApplySuggestion: true,
    };
  }

  if (params.residual === params.suggested) {
    return {
      kind: 'matches',
      text: `Conforme sugestão do sistema: P${params.suggested}`,
      color: 'info.main',
      canApplySuggestion: false,
    };
  }

  return {
    kind: 'differs',
    text: `Valor adotado: P${params.residual} · Sugestão do sistema: P${params.suggested}`,
    color: 'warning.dark',
    canApplySuggestion: true,
  };
};
