import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { useQueryClient } from '@tanstack/react-query';
import { editActionPlan } from '../service/edit-action-plan.service';
import { EditActionPlanParams } from '../service/edit-action-plan.types';
import { patchActionPlanPlanningCache } from '../utils/patch-action-plan-planning-cache';

export type EditActionPlanPlanningParams = Pick<
  EditActionPlanParams,
  | 'companyId'
  | 'workspaceId'
  | 'riskDataId'
  | 'recommendationId'
  | 'monitoringMethod'
  | 'resultCriteria'
>;

export const useMutateEditActionPlanPlanning = () => {
  const queryClient = useQueryClient();
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: (params: EditActionPlanPlanningParams) =>
      editActionPlan({
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        riskDataId: params.riskDataId,
        recommendationId: params.recommendationId,
        monitoringMethod: params.monitoringMethod,
        resultCriteria: params.resultCriteria,
      }),
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyActionPlanEnum.ACTION_PLAN, variables.companyId],
    ],
    onSuccess: (_, variables) => {
      patchActionPlanPlanningCache(queryClient, {
        companyId: variables.companyId,
        workspaceId: variables.workspaceId,
        riskDataId: variables.riskDataId,
        recommendationId: variables.recommendationId,
        monitoringMethod: variables.monitoringMethod ?? null,
        resultCriteria: variables.resultCriteria ?? null,
      });
      onSuccessMessage('Planejamento salvo com sucesso');
    },
    onError: onErrorMessage,
  });
};
