import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { QueryEnum } from 'core/enums/query.enums';
import { queryClient } from 'core/services/queryClient';
import { applyAiAnalysisAsRiskData } from '../service/apply-ai-analysis-as-risk-data.service';

export const useMutateApplyAiAnalysisAsRiskData = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: applyAiAnalysisAsRiskData,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_ANALYSIS,
      variables.companyId,
      variables.applicationId,
    ],
    onSuccess: (result, variables) => {
      if (result?.operationalCompanyId) {
        queryClient.invalidateQueries([
          QueryEnum.RISK_DATA,
          result.operationalCompanyId,
        ]);
        queryClient.invalidateQueries([
          QueryEnum.RISK_DATA,
          result.operationalCompanyId,
          variables.hierarchyId,
        ]);
        queryClient.invalidateQueries([
          QueryEnum.RISK_GROUP_DATA,
          result.operationalCompanyId,
        ]);
      }
      onSuccessMessage('Dados da análise adicionados ao inventário');
    },
    onError: onErrorMessage,
  });
};
