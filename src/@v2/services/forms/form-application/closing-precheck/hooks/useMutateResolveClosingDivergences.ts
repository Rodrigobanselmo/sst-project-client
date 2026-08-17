import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { extractApiError } from '@v2/utils/extract-api-error';
import { IErrorResp } from '@v2/types/error.type';
import { resolveClosingDivergences } from '../service/resolve-closing-divergences.service';
import { ResolveClosingDivergencesParams } from '../service/closing-precheck.types';

function closingResolutionMutationErrorMessage(error: unknown): string {
  const raw =
    typeof error === 'string' ? error : extractApiError(error as IErrorResp);
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return 'Não foi possível aplicar a resolução. Nenhuma alteração foi feita.';
}

export const useMutateResolveClosingDivergences = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: resolveClosingDivergences,
    invalidateQueryKey: (_, variables: ResolveClosingDivergencesParams) => [
      QueryKeyFormEnum.FORM_CLOSING_PRECHECK,
      variables.companyId,
      variables.applicationId,
    ],
    onSuccess: (data) => {
      if (data.applied === 1) {
        onSuccessMessage('Resolução aplicada.');
        return;
      }
      onSuccessMessage(`${data.applied} resoluções aplicadas.`);
    },
    onError: (error) => {
      onErrorMessage(closingResolutionMutationErrorMessage(error));
    },
  });
};
