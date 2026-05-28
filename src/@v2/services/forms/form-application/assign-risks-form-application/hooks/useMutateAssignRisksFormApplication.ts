import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { getKeyBrowseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/hooks/useFetchBrowseFormQuestionsAnswersRisks';
import { getKeyBrowseFormApplicationRiskLog } from '@v2/services/forms/form-application/form-application-risk-log/hooks/useFetchBrowseFormApplicationRiskLog';
import { refetchFormRisksInventoryStatus } from '@v2/services/forms/form-application/shared/refetch-form-risks-inventory-status';
import { useQueryClient } from '@tanstack/react-query';
import { assignRisksFormApplication } from '../service/assign-risks-form-application.service';

export const useMutateAssignRisksFormApplication = () => {
  const queryClient = useQueryClient();
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: assignRisksFormApplication,
    invalidateManyQueryKeys: (_, variables) => [
      getKeyBrowseFormApplicationRiskLog({
        companyId: variables.companyId,
        applicationId: variables.applicationId,
      }),
      getKeyBrowseFormQuestionsAnswersRisks({
        companyId: variables.companyId,
        applicationId: variables.applicationId,
      }),
    ],
    onSuccess: async (_, variables) => {
      await refetchFormRisksInventoryStatus(queryClient, {
        companyId: variables.companyId,
        applicationId: variables.applicationId,
      });
      onSuccessMessage('Risco atribuído com sucesso');
    },
    onError: onErrorMessage,
  });

  return mutate;
};
