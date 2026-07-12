import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { aiCharacterizationAssist } from '../service/ai-characterization-assist.service';

export const useMutateAiCharacterizationAssist = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: aiCharacterizationAssist,
    invalidateManyQueryKeys: (_data, variables) => [
      [
        QueryKeyCharacterizationEnum.AI_CHARACTERIZATION_ASSIST_TRACES,
        variables.companyId,
        variables.workspaceId,
        variables.characterizationId,
      ],
    ],
    onSuccess: () =>
      onSuccessMessage('Assistente de caracterização concluído com sucesso'),
    onError: onErrorMessage,
  });
};
