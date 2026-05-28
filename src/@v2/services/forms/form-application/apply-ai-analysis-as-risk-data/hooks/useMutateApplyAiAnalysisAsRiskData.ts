import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { getKeyBrowseFormQuestionsAnswersRisks } from '@v2/services/forms/form-questions-answers/browse-form-questions-answers-risks/hooks/useFetchBrowseFormQuestionsAnswersRisks';
import { getKeyBrowseFormApplicationRiskLog } from '@v2/services/forms/form-application/form-application-risk-log/hooks/useFetchBrowseFormApplicationRiskLog';
import { refetchFormRisksInventoryStatus } from '@v2/services/forms/form-application/shared/refetch-form-risks-inventory-status';
import { QueryEnum } from 'core/enums/query.enums';
import { useQueryClient } from '@tanstack/react-query';
import { applyAiAnalysisAsRiskData } from '../service/apply-ai-analysis-as-risk-data.service';

export const useMutateApplyAiAnalysisAsRiskData = () => {
  const queryClient = useQueryClient();
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: applyAiAnalysisAsRiskData,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_ANALYSIS,
      variables.companyId,
      variables.applicationId,
    ],
    invalidateManyQueryKeys: (_, variables) => [
      getKeyBrowseFormQuestionsAnswersRisks({
        companyId: variables.companyId,
        applicationId: variables.applicationId,
      }),
      getKeyBrowseFormApplicationRiskLog({
        companyId: variables.companyId,
        applicationId: variables.applicationId,
      }),
    ],
    onSuccess: async (result, variables) => {
      await refetchFormRisksInventoryStatus(queryClient, {
        companyId: variables.companyId,
        applicationId: variables.applicationId,
      });

      if (result?.operationalCompanyId) {
        await queryClient.invalidateQueries({
          queryKey: [QueryEnum.RISK_DATA, result.operationalCompanyId],
        });
        await queryClient.invalidateQueries({
          queryKey: [
            QueryEnum.RISK_DATA,
            result.operationalCompanyId,
            variables.hierarchyId,
          ],
        });
        await queryClient.invalidateQueries({
          queryKey: [QueryEnum.RISK_GROUP_DATA, result.operationalCompanyId],
        });
      }

      onSuccessMessage('Dados da análise adicionados ao inventário');
    },
    onError: onErrorMessage,
  });
};
