import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { examRiskRuleQueryKeys } from '@v2/services/medicine/exam-risk-rule/hooks/exam-risk-rule.query-keys';

import { applyAcgihReference } from '../service/acgih-bei-comparison.service';
import { acgihBeiComparisonQueryKeys } from './acgih-bei-comparison.query-keys';

const outcomeMessages: Record<string, string> = {
  CREATED: 'Fonte complementar adicionada à regra.',
  RESTORED: 'Fonte complementar restaurada na regra.',
  UNCHANGED: 'Esta fonte complementar já estava registrada na regra.',
};

export const useMutateApplyAcgihReference = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: applyAcgihReference,
    // O apply altera a regra de destino e a comparação reflete o vínculo.
    invalidateManyQueryKeys: () => [
      acgihBeiComparisonQueryKeys.all(),
      examRiskRuleQueryKeys.all(),
    ],
    onSuccess: (data) =>
      onSuccessMessage(
        outcomeMessages[data.outcome] ?? 'Fonte complementar aplicada.',
      ),
    onError: onErrorMessage,
  });
};
