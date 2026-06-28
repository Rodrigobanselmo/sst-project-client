import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  getComparisonAiSuggestion,
  removeComparisonReview,
  upsertComparisonReview,
} from '../service/acgih-bei-comparison.service';
import { acgihBeiComparisonQueryKeys } from './acgih-bei-comparison.query-keys';

const outcomeMessages: Record<string, string> = {
  CREATED: 'Decisão técnica registrada.',
  UPDATED: 'Decisão técnica atualizada.',
  RESTORED: 'Decisão técnica reaberta.',
};

/** 4O.1 — cria/atualiza a decisão técnica e reflete na comparação. */
export const useMutateUpsertComparisonReview = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: upsertComparisonReview,
    invalidateManyQueryKeys: () => [acgihBeiComparisonQueryKeys.all()],
    onSuccess: (data) =>
      onSuccessMessage(
        outcomeMessages[data.outcome] ?? 'Decisão técnica registrada.',
      ),
    onError: onErrorMessage,
  });
};

/** 4O.1 — limpa/reabre a decisão técnica (soft-delete). */
export const useMutateRemoveComparisonReview = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: removeComparisonReview,
    invalidateManyQueryKeys: () => [acgihBeiComparisonQueryKeys.all()],
    onSuccess: () => onSuccessMessage('Decisão técnica removida.'),
    onError: onErrorMessage,
  });
};

/**
 * 4O.2 — solicita sugestão de IA (rascunho). Não invalida queries nem grava
 * nada; o resultado apenas pré-popula o modal para revisão humana.
 */
export const useMutateComparisonAiSuggestion = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: getComparisonAiSuggestion,
    invalidateQueryKey: false,
    onError: onErrorMessage,
  });
};
