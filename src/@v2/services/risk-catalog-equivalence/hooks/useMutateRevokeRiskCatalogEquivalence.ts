import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import { revokeRiskCatalogEquivalence } from '../service/risk-catalog-equivalence.service';
import type { BrowseRiskCatalogEquivalencesParams } from '../service/risk-catalog-equivalence.types';
import { riskCatalogEquivalenceQueryKeys } from './risk-catalog-equivalence.query-keys';

export const useMutateRevokeRiskCatalogEquivalence = (
  browseParams: BrowseRiskCatalogEquivalencesParams,
) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: revokeRiskCatalogEquivalence,
    invalidateManyQueryKeys: () => [
      riskCatalogEquivalenceQueryKeys.browse(browseParams),
      ['risk-catalog-equivalence', 'search'],
    ],
    onSuccess: () => onSuccessMessage('Equivalência revogada com sucesso'),
    onError: onErrorMessage,
  });
};
