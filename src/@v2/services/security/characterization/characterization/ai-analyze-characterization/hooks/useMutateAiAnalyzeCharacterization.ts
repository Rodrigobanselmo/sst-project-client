import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { aiAnalyzeCharacterization } from '../service/ai-analyze-characterization.service';

export const useMutateAiAnalyzeCharacterization = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: aiAnalyzeCharacterization,
    invalidateQueryKey: false,
    // invalidateManyQueryKeys: (_, variables) => [
    //   [
    //     QueryKeyCharacterizationEnum.CHARACTERIZATIONS,
    //     variables.companyId,
    //     variables.workspaceId,
    //   ],
    //   // [
    //   //   QueryKeyCharacterizationEnum.CHARACTERIZATION,
    //   //   variables.companyId,
    //   //   variables.workspaceId,
    //   //   variables.characterizationId,
    //   // ],
    // ],
    onSuccess: () => onSuccessMessage('Análise de IA realizada com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
