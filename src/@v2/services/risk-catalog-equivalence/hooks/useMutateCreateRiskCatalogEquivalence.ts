import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import { createRiskCatalogEquivalence } from '../service/risk-catalog-equivalence.service';
import type { BrowseRiskCatalogEquivalencesParams } from '../service/risk-catalog-equivalence.types';
import { riskCatalogEquivalenceQueryKeys } from './risk-catalog-equivalence.query-keys';

export const useMutateCreateRiskCatalogEquivalence = (
  browseParams: BrowseRiskCatalogEquivalencesParams,
) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: createRiskCatalogEquivalence,
    invalidateManyQueryKeys: () => [
      riskCatalogEquivalenceQueryKeys.browse(browseParams),
      ['risk-catalog-equivalence', 'search'],
      ['risk-catalog-equivalence', 'impact-preview'],
    ],
    onSuccess: () =>
      onSuccessMessage('Equivalência registrada com sucesso'),
    onError: onErrorMessage,
  });
};
