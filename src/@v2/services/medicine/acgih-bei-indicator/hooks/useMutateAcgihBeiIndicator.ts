import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  createAcgihBeiIndicator,
  deleteAcgihBeiIndicator,
  updateAcgihBeiIndicator,
  updateAcgihBeiIndicatorStatus,
} from '../service/acgih-bei-indicator.service';
import { acgihBeiIndicatorQueryKeys } from './acgih-bei-indicator.query-keys';

const invalidate = () => [acgihBeiIndicatorQueryKeys.all()];

export const useMutateCreateAcgihBeiIndicator = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: createAcgihBeiIndicator,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Indicador criado'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateAcgihBeiIndicator = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: updateAcgihBeiIndicator,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Indicador atualizado'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateAcgihBeiIndicatorStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: updateAcgihBeiIndicatorStatus,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Status atualizado'),
    onError: onErrorMessage,
  });
};

export const useMutateDeleteAcgihBeiIndicator = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: ({ id }: { id: string }) => deleteAcgihBeiIndicator(id),
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Indicador removido'),
    onError: onErrorMessage,
  });
};
