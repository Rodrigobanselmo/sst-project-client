import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  deleteEsocialProcedure,
  updateEsocialProcedureStatus,
  upsertEsocialProcedure,
} from '../service/esocial-procedure.service';
import { esocialProcedureQueryKeys } from './esocial-procedure.query-keys';

const invalidate = () => [esocialProcedureQueryKeys.all()];

export const useMutateUpsertEsocialProcedure = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: upsertEsocialProcedure,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Curadoria salva'),
    onError: onErrorMessage,
  });
};

export const useMutateUpdateEsocialProcedureStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: updateEsocialProcedureStatus,
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Status atualizado'),
    onError: onErrorMessage,
  });
};

export const useMutateDeleteEsocialProcedure = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: ({ id }: { id: string }) => deleteEsocialProcedure(id),
    invalidateManyQueryKeys: invalidate,
    onSuccess: () => onSuccessMessage('Curadoria removida'),
    onError: onErrorMessage,
  });
};
