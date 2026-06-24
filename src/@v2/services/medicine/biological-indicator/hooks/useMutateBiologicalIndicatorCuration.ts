import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  confirmBiologicalIndicatorExamLink,
  confirmBiologicalIndicatorRiskLink,
  createBiologicalIndicatorExamLink,
  rejectBiologicalIndicatorExamLink,
  rejectBiologicalIndicatorRiskLink,
  setDefaultBiologicalIndicatorExamLink,
  setPrimaryBiologicalIndicatorRiskLink,
  updateBiologicalIndicatorStatus,
} from '../service/biological-indicator.service';
import { biologicalIndicatorQueryKeys } from './biological-indicator.query-keys';

const invalidateIndicator = (indicatorId: string) => [
  biologicalIndicatorQueryKeys.detail(indicatorId),
  biologicalIndicatorQueryKeys.pendencies(indicatorId),
  biologicalIndicatorQueryKeys.riskLinks(indicatorId),
  biologicalIndicatorQueryKeys.examLinks(indicatorId),
  ['biological-indicator', 'browse'],
];

export const useMutateConfirmBiologicalIndicatorRiskLink = (indicatorId: string) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: confirmBiologicalIndicatorRiskLink,
    invalidateManyQueryKeys: () => invalidateIndicator(indicatorId),
    onSuccess: () => onSuccessMessage('Vínculo com risco confirmado'),
    onError: onErrorMessage,
  });
};

export const useMutateRejectBiologicalIndicatorRiskLink = (indicatorId: string) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: rejectBiologicalIndicatorRiskLink,
    invalidateManyQueryKeys: () => invalidateIndicator(indicatorId),
    onSuccess: () => onSuccessMessage('Vínculo com risco rejeitado'),
    onError: onErrorMessage,
  });
};

export const useMutateSetPrimaryBiologicalIndicatorRiskLink = (indicatorId: string) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: ({ linkId }: { linkId: string }) =>
      setPrimaryBiologicalIndicatorRiskLink(linkId),
    invalidateManyQueryKeys: () => invalidateIndicator(indicatorId),
    onSuccess: () => onSuccessMessage('Risco marcado como principal'),
    onError: onErrorMessage,
  });
};

export const useMutateCreateBiologicalIndicatorExamLink = (indicatorId: string) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: createBiologicalIndicatorExamLink,
    invalidateManyQueryKeys: () => invalidateIndicator(indicatorId),
    onSuccess: () => onSuccessMessage('Exame vinculado ao indicador'),
    onError: onErrorMessage,
  });
};

export const useMutateConfirmBiologicalIndicatorExamLink = (indicatorId: string) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: confirmBiologicalIndicatorExamLink,
    invalidateManyQueryKeys: () => invalidateIndicator(indicatorId),
    onSuccess: () => onSuccessMessage('Vínculo com exame confirmado'),
    onError: onErrorMessage,
  });
};

export const useMutateRejectBiologicalIndicatorExamLink = (indicatorId: string) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: rejectBiologicalIndicatorExamLink,
    invalidateManyQueryKeys: () => invalidateIndicator(indicatorId),
    onSuccess: () => onSuccessMessage('Vínculo com exame rejeitado'),
    onError: onErrorMessage,
  });
};

export const useMutateSetDefaultBiologicalIndicatorExamLink = (indicatorId: string) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: ({ linkId }: { linkId: string }) =>
      setDefaultBiologicalIndicatorExamLink(linkId),
    invalidateManyQueryKeys: () => invalidateIndicator(indicatorId),
    onSuccess: () => onSuccessMessage('Exame marcado como padrão'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateBiologicalIndicatorStatus = (indicatorId: string) => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: updateBiologicalIndicatorStatus,
    invalidateManyQueryKeys: () => invalidateIndicator(indicatorId),
    onSuccess: () => onSuccessMessage('Status do indicador atualizado'),
    onError: onErrorMessage,
  });
};
