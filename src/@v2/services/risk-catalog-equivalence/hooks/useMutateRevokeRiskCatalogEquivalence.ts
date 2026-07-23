import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { frpsExplainabilityLibraryQueryKeys } from '@v2/services/forms/frps-explainability-library';

import { revokeRiskCatalogEquivalence } from '../service/risk-catalog-equivalence.service';
import type { BrowseRiskCatalogEquivalencesParams } from '../service/risk-catalog-equivalence.types';
import { riskCatalogEquivalenceQueryKeys } from './risk-catalog-equivalence.query-keys';

export const useMutateRevokeRiskCatalogEquivalence = (
  browseParams: BrowseRiskCatalogEquivalencesParams,
  options?: { successMessage?: string },
) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: revokeRiskCatalogEquivalence,
    invalidateManyQueryKeys: () => [
      riskCatalogEquivalenceQueryKeys.browse(browseParams),
      ['risk-catalog-equivalence', 'search'],
      ['risk-catalog-equivalence', 'impact-preview'],
      frpsExplainabilityLibraryQueryKeys.all,
    ],
    onSuccess: () =>
      onSuccessMessage(
        options?.successMessage ?? 'Equivalência revogada com sucesso',
      ),
    onError: onErrorMessage,
  });
};
