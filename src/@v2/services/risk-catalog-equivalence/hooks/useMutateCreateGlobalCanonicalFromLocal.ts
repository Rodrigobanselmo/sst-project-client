import { useMutation, useQueryClient } from '@tanstack/react-query';

import { frpsExplainabilityLibraryQueryKeys } from '@v2/services/forms/frps-explainability-library/service/frps-explainability-library.query-keys';

import { createGlobalCanonicalFromLocal } from '../service/risk-catalog-equivalence.service';
import type {
  CreateGlobalCanonicalFromLocalParams,
  CreateGlobalCanonicalFromLocalResult,
} from '../service/create-global-canonical.types';
export function useMutateCreateGlobalCanonicalFromLocal() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateGlobalCanonicalFromLocalResult,
    unknown,
    CreateGlobalCanonicalFromLocalParams
  >({
    mutationFn: createGlobalCanonicalFromLocal,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: frpsExplainabilityLibraryQueryKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: ['risk-catalog-equivalence'],
        }),
      ]);
    },
  });
}
