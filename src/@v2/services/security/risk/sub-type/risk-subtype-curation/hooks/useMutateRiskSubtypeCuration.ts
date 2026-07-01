import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import { riskSubTypeMasterQueryKeys } from '../../risk-sub-type-master/risk-sub-type-master.query-keys';
import {
  bulkAssignRiskSubtype,
  bulkClearRiskSubtype,
} from '../risk-subtype-curation.service';

export const useMutateBulkAssignRiskSubtype = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: bulkAssignRiskSubtype,
    invalidateManyQueryKeys: () => [
      ['risk-subtype-curation', 'risks'],
      ['risk-sub-type-master', 'browse'],
    ],
    onSuccess: (result) =>
      onSuccessMessage(
        `Atualizados: ${result.updated}. Ignorados: ${result.skipped}.`,
      ),
    onError: onErrorMessage,
  });
};

export const useMutateBulkClearRiskSubtype = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: bulkClearRiskSubtype,
    invalidateManyQueryKeys: () => [
      ['risk-subtype-curation', 'risks'],
      ['risk-sub-type-master', 'browse'],
    ],
    onSuccess: (result) =>
      onSuccessMessage(
        `Subtipo removido de ${result.updated} risco(s). Ignorados: ${result.skipped}.`,
      ),
    onError: onErrorMessage,
  });
};
