import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateFrpsLibraryConceptual } from '../service/frps-explainability-library.service';
import { frpsExplainabilityLibraryQueryKeys } from '../service/frps-explainability-library.query-keys';
import type { GenerateFrpsLibraryConceptualParams } from '../service/frps-explainability-library.types';

export function useMutateGenerateFrpsLibraryConceptual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: GenerateFrpsLibraryConceptualParams) =>
      generateFrpsLibraryConceptual(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: frpsExplainabilityLibraryQueryKeys.all,
      });
    },
  });
}
