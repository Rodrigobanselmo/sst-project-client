import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  createExamRiskRuleAiDrafts,
  createExamRiskRuleAiPreset,
  createExamRiskRule,
  deleteExamRiskRuleAiPreset,
  deleteExamRiskRule,
  deleteExamRiskRuleReference,
  dryRunExamRiskRuleAiSuggestions,
  syncExamRiskRulesNr07,
  syncExamRiskRulesAcgihBei,
  updateExamRiskRuleAiPreset,
  updateExamRiskRule,
  updateExamRiskRuleStatus,
} from '../service/exam-risk-rule.service';
import { examRiskRuleQueryKeys } from './exam-risk-rule.query-keys';

const invalidate = () => [examRiskRuleQueryKeys.all()];
const invalidateAiPresets = () => [examRiskRuleQueryKeys.aiPresetsRoot()];

export const useMutateCreateExamRiskRule = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: createExamRiskRule,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Regra criada'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateExamRiskRule = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: updateExamRiskRule,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Regra atualizada'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateExamRiskRuleStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: updateExamRiskRuleStatus,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Status atualizado'),
    onError: onErrorMessage,
  });
};

export const useMutateSyncExamRiskRulesNr07 = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: syncExamRiskRulesNr07,
    invalidateManyQueryKeys: invalidate,
    onError: onErrorMessage,
  });
};

export const useMutateSyncExamRiskRulesAcgihBei = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: syncExamRiskRulesAcgihBei,
    invalidateManyQueryKeys: invalidate,
    onError: onErrorMessage,
  });
};

export const useMutateDeleteExamRiskRule = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: ({ id }: { id: string }) => deleteExamRiskRule(id),
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Regra removida'),
    onError: onErrorMessage,
  });
};

export const useMutateDeleteExamRiskRuleReference = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: deleteExamRiskRuleReference,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Fonte complementar removida'),
    onError: onErrorMessage,
  });
};

export const useMutateDryRunExamRiskRuleAiSuggestions = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: dryRunExamRiskRuleAiSuggestions,
    invalidateQueryKey: false,
    onError: onErrorMessage,
  });
};

export const useMutateCreateExamRiskRuleAiDrafts = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: createExamRiskRuleAiDrafts,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Rascunhos criados'),
    onError: onErrorMessage,
  });
};

export const useMutateCreateExamRiskRuleAiPreset = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: createExamRiskRuleAiPreset,
    invalidateManyQueryKeys: invalidateAiPresets,
    onSuccess: () => onSuccessMessage('Modelo salvo'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateExamRiskRuleAiPreset = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: updateExamRiskRuleAiPreset,
    invalidateManyQueryKeys: invalidateAiPresets,
    onSuccess: () => onSuccessMessage('Modelo atualizado'),
    onError: onErrorMessage,
  });
};

export const useMutateDeleteExamRiskRuleAiPreset = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: ({ presetId }: { presetId: string }) =>
      deleteExamRiskRuleAiPreset(presetId),
    invalidateManyQueryKeys: invalidateAiPresets,
    onSuccess: () => onSuccessMessage('Modelo inativado'),
    onError: onErrorMessage,
  });
};
