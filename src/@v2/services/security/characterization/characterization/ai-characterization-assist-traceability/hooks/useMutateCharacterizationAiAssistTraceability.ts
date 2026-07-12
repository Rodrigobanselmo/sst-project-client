import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import {
  applyCharacterizationAiAssistTrace,
  markSavedCharacterizationAiAssistTrace,
} from '../service/ai-characterization-assist-traceability.service';

export const useMutateApplyCharacterizationAiAssistTrace = () => {
  const { onErrorMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: applyCharacterizationAiAssistTrace,
    invalidateManyQueryKeys: (_data, variables) => [
      [
        QueryKeyCharacterizationEnum.AI_CHARACTERIZATION_ASSIST_TRACES,
        variables.companyId,
        variables.workspaceId,
        variables.characterizationId,
      ],
    ],
    onError: onErrorMessage,
  });
};

export const useMutateMarkSavedCharacterizationAiAssistTrace = () => {
  const { onErrorMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: markSavedCharacterizationAiAssistTrace,
    invalidateManyQueryKeys: (_data, variables) => [
      [
        QueryKeyCharacterizationEnum.AI_CHARACTERIZATION_ASSIST_TRACES,
        variables.companyId,
        variables.workspaceId,
        variables.characterizationId,
      ],
    ],
    onError: onErrorMessage,
  });
};
