import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import { suggestRiskSubtypeCandidates } from '../risk-subtype-curation.service';

export const useMutateSuggestRiskSubtypeCandidates = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: suggestRiskSubtypeCandidates,
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};
